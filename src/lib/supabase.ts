import { createClient } from "@supabase/supabase-js";
import { LegalArticle, LawUpdateSubmission, PortalUser } from "../types";

// Read environment variables
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

// Check if Supabase is properly configured
export const isSupabaseConfigured = 
  SUPABASE_URL.trim() !== "" && 
  SUPABASE_ANON_KEY.trim() !== "" &&
  !SUPABASE_URL.includes("YOUR_") &&
  !SUPABASE_ANON_KEY.includes("YOUR_");

// Lazy initialization of Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Clean instructions for setting up tables
export const SUPABASE_SQL_SCHEMA = `-- COPY AND PASTE THIS SQL INTO YOUR SUPABASE SQL EDITOR TO SETUP TABLES:

-- 1. Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  author TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT,
  is_breaking BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  case_details JSONB
);

-- Enable Row Level Security (RLS) or disable for simple public prototyping:
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- 2. Create contributors table
CREATE TABLE IF NOT EXISTS contributors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'contributor',
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contributors DISABLE ROW LEVEL SECURITY;

-- Insert a default contributor if you want, or handle dynamically
-- INSERT INTO contributors (id, name, email, role, password) 
-- VALUES ('admin-default', 'Supreme Admin', 'admin@sparklaw.in', 'admin', 'admin123') 
-- ON CONFLICT DO NOTHING;

-- 3. Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  court TEXT NOT NULL,
  case_number TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  email TEXT NOT NULL,
  bench TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
`;

// Helper functions that automatically route requests to either Supabase or LocalStorage
export const db = {
  // --- ARTICLES ---
  async getArticles(): Promise<LegalArticle[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .order("published_at", { ascending: false });

        if (error) throw error;
        
        return (data || []).map(item => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          content: item.content,
          category: item.category,
          subcategory: item.subcategory || undefined,
          author: item.author,
          publishedAt: item.published_at,
          imageUrl: item.image_url || undefined,
          isBreaking: item.is_breaking || false,
          tags: item.tags || [],
          views: item.views || 0,
          caseDetails: item.case_details ? {
            caseName: item.case_details.caseName,
            citation: item.case_details.citation,
            bench: item.case_details.bench,
            date: item.case_details.date,
            caseNumber: item.case_details.caseNumber,
          } : undefined
        }));
      } catch (err) {
        console.error("Supabase getArticles error, falling back to local storage:", err);
      }
    }

    // Local storage fallback
    const saved = localStorage.getItem("sparklaw_articles");
    return saved ? JSON.parse(saved) : [];
  },

  async saveArticle(article: LegalArticle): Promise<void> {
    if (supabase) {
      try {
        const payload = {
          id: article.id,
          title: article.title,
          summary: article.summary,
          content: article.content,
          category: article.category,
          subcategory: article.subcategory || null,
          author: article.author,
          published_at: article.publishedAt,
          image_url: article.imageUrl || null,
          is_breaking: article.isBreaking,
          tags: article.tags,
          views: article.views,
          case_details: article.caseDetails || null
        };

        const { error } = await supabase
          .from("articles")
          .upsert(payload);

        if (error) throw error;
        return;
      } catch (err) {
        console.error("Supabase saveArticle error:", err);
      }
    }

    // Local storage state fallback
    const saved = localStorage.getItem("sparklaw_articles");
    const current = saved ? JSON.parse(saved) : [];
    const updated = [article, ...current.filter((a: LegalArticle) => a.id !== article.id)];
    localStorage.setItem("sparklaw_articles", JSON.stringify(updated));
  },

  async deleteArticle(id: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("articles")
          .delete()
          .eq("id", id);

        if (error) throw error;
        return;
      } catch (err) {
        console.error("Supabase deleteArticle error:", err);
      }
    }

    const saved = localStorage.getItem("sparklaw_articles");
    if (saved) {
      const current = JSON.parse(saved);
      const updated = current.filter((a: LegalArticle) => a.id !== id);
      localStorage.setItem("sparklaw_articles", JSON.stringify(updated));
    }
  },

  // --- CONTRIBUTORS / PORTAL USERS ---
  async getContributors(): Promise<PortalUser[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("contributors")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        return (data || []).map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          role: item.role as "admin" | "contributor",
          password: item.password,
          createdAt: item.created_at
        }));
      } catch (err) {
        console.error("Supabase getContributors error, falling back to local storage:", err);
      }
    }

    const saved = localStorage.getItem("sparklaw_contributors");
    return saved ? JSON.parse(saved) : [];
  },

  async saveContributor(user: PortalUser): Promise<void> {
    if (supabase) {
      try {
        const payload = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          password: user.password || "",
          created_at: user.createdAt
        };

        const { error } = await supabase
          .from("contributors")
          .upsert(payload);

        if (error) throw error;
        return;
      } catch (err) {
        console.error("Supabase saveContributor error:", err);
      }
    }

    const saved = localStorage.getItem("sparklaw_contributors");
    const current = saved ? JSON.parse(saved) : [];
    const updated = [...current.filter((u: PortalUser) => u.id !== user.id), user];
    localStorage.setItem("sparklaw_contributors", JSON.stringify(updated));
  },

  async deleteContributor(id: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("contributors")
          .delete()
          .eq("id", id);

        if (error) throw error;
        return;
      } catch (err) {
        console.error("Supabase deleteContributor error:", err);
      }
    }

    const saved = localStorage.getItem("sparklaw_contributors");
    if (saved) {
      const current = JSON.parse(saved);
      const updated = current.filter((u: PortalUser) => u.id !== id);
      localStorage.setItem("sparklaw_contributors", JSON.stringify(updated));
    }
  },

  // --- PUBLIC ADVOCATE SUBMISSIONS ---
  async getSubmissions(): Promise<LawUpdateSubmission[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) throw error;

        return (data || []).map(item => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          court: item.court,
          caseNumber: item.case_number,
          submittedBy: item.submitted_by,
          email: item.email,
          bench: item.bench || undefined,
          status: item.status as "pending" | "approved" | "rejected",
          submittedAt: item.submitted_at
        }));
      } catch (err) {
        console.error("Supabase getSubmissions error, falling back to local storage:", err);
      }
    }

    const saved = localStorage.getItem("sparklaw_submissions");
    return saved ? JSON.parse(saved) : [];
  },

  async saveSubmission(sub: LawUpdateSubmission): Promise<void> {
    if (supabase) {
      try {
        const payload = {
          id: sub.id,
          title: sub.title,
          summary: sub.summary,
          court: sub.court,
          case_number: sub.caseNumber,
          submitted_by: sub.submittedBy,
          email: sub.email,
          bench: sub.bench || null,
          status: sub.status,
          submitted_at: sub.submittedAt
        };

        const { error } = await supabase
          .from("submissions")
          .upsert(payload);

        if (error) throw error;
        return;
      } catch (err) {
        console.error("Supabase saveSubmission error:", err);
      }
    }

    const saved = localStorage.getItem("sparklaw_submissions");
    const current = saved ? JSON.parse(saved) : [];
    const updated = [sub, ...current.filter((s: LawUpdateSubmission) => s.id !== sub.id)];
    localStorage.setItem("sparklaw_submissions", JSON.stringify(updated));
  },

  async updateSubmissionStatus(id: string, status: "approved" | "rejected"): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("submissions")
          .update({ status })
          .eq("id", id);

        if (error) throw error;
        return;
      } catch (err) {
        console.error("Supabase updateSubmissionStatus error:", err);
      }
    }

    const saved = localStorage.getItem("sparklaw_submissions");
    if (saved) {
      const current = JSON.parse(saved);
      const updated = current.map((s: LawUpdateSubmission) => s.id === id ? { ...s, status } : s);
      localStorage.setItem("sparklaw_submissions", JSON.stringify(updated));
    }
  }
};
