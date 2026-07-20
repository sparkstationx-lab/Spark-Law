import React, { useState } from "react";
import { 
  Users, 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Lock, 
  LogOut, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  BookOpen, 
  Folder, 
  FileCheck, 
  UserPlus,
  Scale,
  Database,
  DatabaseZap
} from "lucide-react";
import { LegalArticle, LawUpdateSubmission, PortalUser } from "../types";
import { CATEGORIES, HIGH_COURTS_LIST } from "../data";
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA, supabase, lastSupabaseError } from "../lib/supabase";

interface AdminDashboardProps {
  articles: LegalArticle[];
  onAddArticle: (article: LegalArticle) => void;
  onDeleteArticle: (id: string) => void;
  submissions: LawUpdateSubmission[];
  onUpdateSubmissionStatus: (id: string, status: "approved" | "rejected") => void;
  users: PortalUser[];
  onAddUser: (user: PortalUser) => void;
  onDeleteUser: (id: string) => void;
  onClose: () => void;
}

const PRESET_IMAGES = [
  { name: "Courthouse Gavel", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800" },
  { name: "Law Library", url: "https://images.unsplash.com/photo-1505664194779-8bebcb95c553?auto=format&fit=crop&q=80&w=800" },
  { name: "Supreme Court Pillars", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800" },
  { name: "Corporate Consulting", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800" },
  { name: "Legal Document Signature", url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800" }
];

export function AdminDashboard({
  articles,
  onAddArticle,
  onDeleteArticle,
  submissions,
  onUpdateSubmissionStatus,
  users,
  onAddUser,
  onDeleteUser,
  onClose
}: AdminDashboardProps) {
  // Auth state
  const [currentUser, setCurrentUser] = useState<PortalUser | null>(() => {
    const saved = localStorage.getItem("sparklaw_current_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<"upload" | "manage_news" | "users" | "submissions">("upload");

  // Form State: Upload Article
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Supreme Court");
  const [subcategory, setSubcategory] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isCaseArticle, setIsCaseArticle] = useState(true);

  // Case Details Subform
  const [caseName, setCaseName] = useState("");
  const [citation, setCitation] = useState("");
  const [bench, setBench] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [caseDate, setCaseDate] = useState("");

  // Form State: Add User
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "contributor">("contributor");
  const [userFormError, setUserFormError] = useState("");
  const [userFormSuccess, setUserFormSuccess] = useState("");

  const [publishSuccess, setPublishSuccess] = useState(false);

  // Handle Login
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      // 1. Check built-in supreme administrator fallback credentials (for quick testing/failsafes)
      if (email.trim() === "admin@sparklaw.in" && password === "admin123") {
        const adminUser: PortalUser = {
          id: "admin-default",
          name: "Supreme Administrator",
          email: "admin@sparklaw.in",
          role: "admin",
          createdAt: new Date().toISOString()
        };
        setCurrentUser(adminUser);
        localStorage.setItem("sparklaw_current_user", JSON.stringify(adminUser));
        return;
      }

      // 2. If Supabase is configured, attempt real-time cloud query
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("contributors")
          .select("*")
          .eq("email", email.trim().toLowerCase())
          .eq("password", password)
          .maybeSingle();

        if (error) {
          console.error("Supabase authenticating error:", error);
        } else if (data) {
          const userSession: PortalUser = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role as "admin" | "contributor",
            createdAt: data.created_at
          };
          setCurrentUser(userSession);
          localStorage.setItem("sparklaw_current_user", JSON.stringify(userSession));
          return;
        }
      }

      // 3. Fallback to check registered local contributors list
      const matchedUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
      if (matchedUser) {
        const userSession: PortalUser = {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          createdAt: matchedUser.createdAt
        };
        setCurrentUser(userSession);
        localStorage.setItem("sparklaw_current_user", JSON.stringify(userSession));
      } else {
        setLoginError("Invalid email or password. Try admin@sparklaw.in with password admin123");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setLoginError("An unexpected error occurred during sign-in. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("sparklaw_current_user");
  };

  // Handle Article Publication
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) {
      alert("Please fill in the title, summary, and article body.");
      return;
    }

    const finalImage = customImageUrl.trim() ? customImageUrl.trim() : imageUrl;

    const newArticle: LegalArticle = {
      id: `art-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category,
      subcategory: subcategory.trim() || undefined,
      author: currentUser?.name || "Spark Law Editorial Desk",
      publishedAt: new Date().toISOString(),
      imageUrl: finalImage,
      isBreaking,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
      views: 0,
      caseDetails: isCaseArticle ? {
        caseName: caseName.trim() || "Case Reference",
        citation: citation.trim() || `2026 Spark Law (${category.substring(0,2)}) ${Math.floor(Math.random() * 500) + 1}`,
        bench: bench.trim() || "Spark Law Bench",
        date: caseDate ? new Date(caseDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        caseNumber: caseNumber.trim() || "N/A"
      } : undefined
    };

    onAddArticle(newArticle);
    setPublishSuccess(true);
    
    // Reset fields
    setTitle("");
    setSummary("");
    setContent("");
    setSubcategory("");
    setTagsInput("");
    setIsBreaking(false);
    setCustomImageUrl("");
    setCaseName("");
    setCitation("");
    setBench("");
    setCaseNumber("");
    setCaseDate("");

    setTimeout(() => setPublishSuccess(false), 4000);
  };

  // Handle Adding User
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError("");
    setUserFormSuccess("");

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setUserFormError("All fields are required.");
      return;
    }

    if (users.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase()) || newUserEmail.toLowerCase() === "admin@sparklaw.in") {
      setUserFormError("A user with this email address already exists.");
      return;
    }

    const newUser: PortalUser = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      password: newUserPassword,
      createdAt: new Date().toISOString()
    };

    onAddUser(newUser);
    setUserFormSuccess(`Writer "${newUserName}" has been added successfully!`);
    
    // Clear Form
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("contributor");
  };

  // Convert Advocate submission directly to article
  const handleApproveSubmission = (sub: LawUpdateSubmission) => {
    const matchedPreset = PRESET_IMAGES[Math.floor(Math.random() * PRESET_IMAGES.length)];
    
    const convertedArticle: LegalArticle = {
      id: `art-sub-${sub.id}`,
      title: `APPROVED: ${sub.title}`,
      summary: sub.summary,
      content: `### Advocate Submission Summary\n\n${sub.summary}\n\n*This critical case report was pitched and drafted by Advocate ${sub.submittedBy} (${sub.email}) and formally approved for publication by the Spark Law Admin panel.*`,
      category: "Supreme Court",
      subcategory: sub.court,
      author: sub.submittedBy,
      publishedAt: new Date().toISOString(),
      imageUrl: matchedPreset.url,
      isBreaking: false,
      tags: ["Advocate Pitch", "Judicial Updates", sub.court],
      views: 12,
      caseDetails: {
        caseName: sub.title,
        citation: `2026 Spark Law (Sub) ${Math.floor(Math.random() * 200) + 1}`,
        bench: sub.bench || "Hon'ble Bench",
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        caseNumber: sub.caseNumber
      }
    };

    onAddArticle(convertedArticle);
    onUpdateSubmissionStatus(sub.id, "approved");
    alert(`Submission approved! It is now a live published article on Spark Law.`);
  };

  // If NOT logged in, show elegant login page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6" id="login-container">
        <div className="w-full max-w-md bg-neutral-800 rounded-xl border border-neutral-700 shadow-2xl overflow-hidden animate-fade-in" id="login-card">
          <div className="p-8 border-b border-neutral-700 text-center relative">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
              id="login-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center space-x-2 text-red-500 mb-2">
              <Scale className="w-8 h-8" />
              <span className="font-extrabold text-2xl tracking-tighter text-white font-sans">
                SPARK LAW
              </span>
            </div>
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold">
              Internal Staff & Admin Portal
            </p>
          </div>

          <div className="p-8">
            {loginError && (
              <div className="mb-4 bg-red-950/40 border border-red-800 text-red-400 text-xs p-3 rounded flex items-start gap-2" id="login-error-alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sparklaw.in"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition"
                  id="login-email-input"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition"
                  id="login-password-input"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-bold text-sm py-3 px-4 rounded transition shadow-lg mt-6 disabled:opacity-60 disabled:cursor-wait"
                id="login-submit-btn"
              >
                {isLoggingIn ? "Verifying Credentials..." : "Sign In to Dashboard"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-700 text-xs text-neutral-400 space-y-2">
              <p className="font-semibold text-neutral-300">Default Sandbox Credentials:</p>
              <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800 font-mono text-[11px] text-red-400">
                <p>Email: admin@sparklaw.in</p>
                <p>Password: admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans" id="admin-dashboard-container">
      {/* Top Banner */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-red-800 p-2 rounded-lg">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <h1 className="font-extrabold text-xl tracking-tighter text-white">SPARK LAW</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-950 px-2 py-0.5 rounded border border-red-900">
                Staff Control Room
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Welcome back, <span className="text-red-400 font-semibold">{currentUser.name}</span> ({currentUser.role === "admin" ? "Administrator" : "Writer Contributor"})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white px-4 py-2 rounded text-xs font-semibold transition"
            id="dash-view-portal-btn"
          >
            Go To Live Portal
          </button>
          <button
            onClick={handleLogout}
            className="bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-neutral-300 hover:text-white p-2.5 rounded transition flex items-center space-x-2 text-xs font-semibold"
            id="dash-logout-btn"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Panel Content */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Controls */}
        <aside className="lg:col-span-1 bg-neutral-900 rounded-xl border border-neutral-800 p-4 space-y-2 self-start">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-3 mb-3">Navigation Menu</h2>
          
          <button
            onClick={() => setActiveTab("upload")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-3 transition ${
              activeTab === "upload" 
                ? "bg-red-800 text-white shadow-md shadow-red-900/20" 
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
            id="tab-upload-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Upload News Update</span>
          </button>

          <button
            onClick={() => setActiveTab("manage_news")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-3 transition ${
              activeTab === "manage_news" 
                ? "bg-red-800 text-white shadow-md shadow-red-900/20" 
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
            id="tab-manage-btn"
          >
            <FileText className="w-4 h-4" />
            <span>Manage Published News ({articles.length})</span>
          </button>

          {currentUser.role === "admin" && (
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-3 transition ${
                activeTab === "users" 
                  ? "bg-red-800 text-white shadow-md shadow-red-900/20" 
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
              id="tab-users-btn"
            >
              <Users className="w-4 h-4" />
              <span>Manage Writers & Team ({users.length + 1})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("submissions")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-3 transition ${
              activeTab === "submissions" 
                ? "bg-red-800 text-white shadow-md shadow-red-900/20" 
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
            id="tab-submissions-btn"
          >
            <FileCheck className="w-4 h-4" />
            <div className="flex-1 flex justify-between items-center">
              <span>Advocate Submissions</span>
              {submissions.filter(s => s.status === "pending").length > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {submissions.filter(s => s.status === "pending").length}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("database")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-3 transition ${
              activeTab === "database" 
                ? "bg-red-800 text-white shadow-md shadow-red-900/20" 
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
            id="tab-database-btn"
          >
            <DatabaseZap className="w-4 h-4 shrink-0" />
            <div className="flex-1 flex justify-between items-center">
              <span>Database Cloud API</span>
              <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? "bg-green-500 shadow-sm shadow-green-500/55 animate-pulse" : "bg-amber-500 shadow-sm shadow-amber-500/55"}`} />
            </div>
          </button>

          <div className="pt-6 mt-6 border-t border-neutral-800 px-3 text-xs text-neutral-500">
            <p className="font-semibold text-neutral-400">Spark Law Desk Guidelines:</p>
            <p className="mt-1 leading-relaxed">
              Always double-check judicial citation formats and legal dates before submitting articles. High Courts require specifying subcategories.
            </p>
          </div>
        </aside>

        {/* Dashboard Panels */}
        <main className="lg:col-span-3 bg-neutral-900 rounded-xl border border-neutral-800 p-6 md:p-8">
          
          {/* TAB 1: UPLOAD NEWS */}
          {activeTab === "upload" && (
            <div className="space-y-6" id="panel-upload-news">
              <div className="border-b border-neutral-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-500" />
                  Publish New Legal Report
                </h2>
                <p className="text-xs text-neutral-400">
                  Write and publish legal updates, Supreme Court case reviews, or law school updates live onto the portal.
                </p>
              </div>

              {publishSuccess && (
                <div className="bg-green-950/40 border border-green-800 text-green-400 p-4 rounded text-xs flex items-center gap-2 animate-fade-in" id="publish-success-alert">
                  <Check className="w-4 h-4" />
                  <span>Legal update has been compiled and added live to the Spark Law feed!</span>
                </div>
              )}

              <form onSubmit={handlePublish} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="E.g., Supreme Court Declares Right to Clean Environment Part of Article 21"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition"
                      id="news-title-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                      Primary Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition"
                      id="news-category-select"
                    >
                      {CATEGORIES.filter(c => c !== "All Updates").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                      Subcategory / Specific Court / Institution
                    </label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="E.g., Delhi High Court, NCLAT, NLSIU Bangalore"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition"
                      id="news-subcategory-input"
                    />
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Recommended for High Courts or Specific tribunals.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="environment, article 21, constitutional law"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition"
                      id="news-tags-input"
                    />
                  </div>
                </div>

                <div className="bg-neutral-950/50 p-4 rounded-lg border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCaseArticle}
                        onChange={(e) => setIsCaseArticle(e.target.checked)}
                        className="rounded bg-neutral-950 border-neutral-800 text-red-800 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Include Official Court Citation & Case Details
                      </span>
                    </label>
                  </div>

                  {isCaseArticle && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-neutral-400 uppercase mb-1">
                          Official Case Name
                        </label>
                        <input
                          type="text"
                          value={caseName}
                          onChange={(e) => setCaseName(e.target.value)}
                          placeholder="M.K. Ranjitsinh v. Union of India"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-neutral-400 uppercase mb-1">
                          Law Journal Citation
                        </label>
                        <input
                          type="text"
                          value={citation}
                          onChange={(e) => setCitation(e.target.value)}
                          placeholder="2026 Spark Law (SC) 104"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-neutral-400 uppercase mb-1">
                          Bench (Judges)
                        </label>
                        <input
                          type="text"
                          value={bench}
                          onChange={(e) => setBench(e.target.value)}
                          placeholder="Justice Sanjiv Khanna, Justice Dipankar Datta"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-neutral-400 uppercase mb-1">
                            Case Record No.
                          </label>
                          <input
                            type="text"
                            value={caseNumber}
                            onChange={(e) => setCaseNumber(e.target.value)}
                            placeholder="W.P. (C) No. 12/2026"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-neutral-400 uppercase mb-1">
                            Date of Judgement
                          </label>
                          <input
                            type="date"
                            value={caseDate}
                            onChange={(e) => setCaseDate(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Select Display Cover Image
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => {
                          setImageUrl(img.url);
                          setCustomImageUrl("");
                        }}
                        className={`relative rounded overflow-hidden h-16 border-2 transition ${
                          imageUrl === img.url && !customImageUrl 
                            ? "border-red-500" 
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-center text-white py-0.5 truncate">
                          {img.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Or paste a custom image URL..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition"
                    id="news-custom-image-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    One-Sentence Summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Provide a high-density, authoritative one-sentence summary of this legal event."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition"
                    id="news-summary-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Full Article / Judgment Body *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type the legal reporting article here. Markdown syntax is supported (e.g., # Headings, **bold**, *italics*, bullet points)."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-sm text-white font-sans focus:outline-none focus:border-red-500 transition"
                    id="news-content-textarea"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBreaking}
                      onChange={(e) => setIsBreaking(e.target.checked)}
                      className="rounded bg-neutral-950 border-neutral-800 text-red-800 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                      Flag as Breaking News Alert
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-bold text-xs py-2.5 px-6 rounded transition shadow-lg uppercase tracking-wider"
                    id="publish-submit-btn"
                  >
                    Publish Article live
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MANAGE NEWS */}
          {activeTab === "manage_news" && (
            <div className="space-y-6" id="panel-manage-news">
              <div className="border-b border-neutral-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-500" />
                  Manage Published News
                </h2>
                <p className="text-xs text-neutral-400">
                  Review all current publications on Spark Law. Deleting articles immediately updates the reader portal feed.
                </p>
              </div>

              {articles.length === 0 ? (
                <div className="text-center py-16 bg-neutral-950/40 rounded-lg border border-dashed border-neutral-800" id="manage-empty">
                  <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-neutral-400">The News Desk is completely clear.</p>
                  <p className="text-xs text-neutral-500 mt-1">Upload articles to see them listed here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto" id="manage-table-container">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-800 text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Title / Category</th>
                        <th className="py-3 px-4">Date & Author</th>
                        <th className="py-3 px-4">Citation</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-neutral-850">
                      {articles.map((art) => (
                        <tr key={art.id} className="hover:bg-neutral-850/40 transition">
                          <td className="py-4 px-4">
                            <div className="font-semibold text-neutral-200 max-w-sm truncate" title={art.title}>
                              {art.title}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-[10px] text-red-400 font-semibold uppercase">
                                {art.category}
                              </span>
                              {art.subcategory && (
                                <span className="text-[10px] text-neutral-500">
                                  • {art.subcategory}
                                </span>
                              )}
                              {art.isBreaking && (
                                <span className="text-[8px] bg-red-950 text-red-400 border border-red-900 px-1 rounded font-bold uppercase">
                                  BREAKING
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-neutral-400">
                            <div>{new Date(art.publishedAt).toLocaleDateString()}</div>
                            <div className="text-[10px] text-neutral-500">By {art.author}</div>
                          </td>
                          <td className="py-4 px-4 font-mono text-neutral-300">
                            {art.caseDetails?.citation || <span className="text-neutral-600">None</span>}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${art.title}"?`)) {
                                  onDeleteArticle(art.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950/30 transition inline-flex items-center space-x-1"
                              title="Delete Article"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANAGE USERS / WRITERS */}
          {activeTab === "users" && currentUser.role === "admin" && (
            <div className="space-y-6" id="panel-manage-users">
              <div className="border-b border-neutral-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-500" />
                  Manage Spark Law News Writers
                </h2>
                <p className="text-xs text-neutral-400">
                  Register legal analysts, journalists, or senior editors who can log in to post or edit articles.
                </p>
              </div>

              {/* Add User Form */}
              <div className="bg-neutral-950/40 p-5 rounded-lg border border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-red-500" />
                  Register New Writer
                </h3>

                {userFormError && (
                  <div className="mb-4 bg-red-950/40 border border-red-800 text-red-400 text-xs p-3 rounded flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{userFormError}</span>
                  </div>
                )}

                {userFormSuccess && (
                  <div className="mb-4 bg-green-950/40 border border-green-800 text-green-400 text-xs p-3 rounded flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{userFormSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="E.g., Harish Salve"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="writer@sparklaw.in"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                      Portal Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Set access password"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-bold text-xs py-2.5 px-4 rounded transition tracking-wider uppercase"
                  >
                    Add Contributor
                  </button>
                </form>
              </div>

              {/* Users List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">
                  Registered Authorized Team
                </h3>

                <div className="bg-neutral-950/30 border border-neutral-800 rounded-lg overflow-hidden">
                  <div className="divide-y divide-neutral-850">
                    {/* Primary Admin (Immutable) */}
                    <div className="p-4 flex items-center justify-between text-xs hover:bg-neutral-850/20">
                      <div>
                        <div className="font-bold text-neutral-200">Supreme Administrator (Default)</div>
                        <div className="text-neutral-500">admin@sparklaw.in</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="bg-red-950 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-900 uppercase">
                          Admin Root
                        </span>
                        <span className="text-[10px] text-neutral-500">System Lock</span>
                      </div>
                    </div>

                    {/* Custom Users */}
                    {users.map((u) => (
                      <div key={u.id} className="p-4 flex items-center justify-between text-xs hover:bg-neutral-850/20">
                        <div>
                          <div className="font-bold text-neutral-200">{u.name}</div>
                          <div className="text-neutral-500">{u.email}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="bg-neutral-800 text-neutral-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-neutral-700 uppercase">
                            {u.role}
                          </span>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove access for "${u.name}"?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="text-neutral-500 hover:text-red-400 p-1 rounded transition"
                            title="Revoke access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADVOCATE SUBMISSIONS AUDITING */}
          {activeTab === "submissions" && (
            <div className="space-y-6" id="panel-submissions">
              <div className="border-b border-neutral-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-red-500" />
                  Advocate Case Submissions Auditing
                </h2>
                <p className="text-xs text-neutral-400">
                  Review case reports, legal updates, and summaries submitted via the public "Advocate Pitch Updates" form. Approving a pitch converts it directly into a live news post.
                </p>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-16 bg-neutral-950/40 rounded-lg border border-dashed border-neutral-800">
                  <FileCheck className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-neutral-400">No advocate submissions have been filed.</p>
                  <p className="text-xs text-neutral-500 mt-1">Public submissions from advocates will arrive here for approval.</p>
                </div>
              ) : (
                <div className="space-y-4" id="submissions-list">
                  {submissions.map((sub) => (
                    <div 
                      key={sub.id} 
                      className={`p-5 rounded-lg border transition ${
                        sub.status === "approved" 
                          ? "bg-green-950/10 border-green-900/50" 
                          : sub.status === "rejected"
                          ? "bg-red-950/10 border-red-900/50 opacity-60"
                          : "bg-neutral-950/50 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-red-950 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-900 uppercase">
                              {sub.court}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              Filed {new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-neutral-200 mt-1">{sub.title}</h3>
                          <p className="text-xs text-neutral-400 font-mono mt-0.5">
                            Case No: {sub.caseNumber} {sub.bench && `| Bench: ${sub.bench}`}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {sub.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApproveSubmission(sub)}
                                className="bg-green-900 hover:bg-green-800 text-white font-bold text-[10px] px-3 py-1.5 rounded transition flex items-center space-x-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve & Publish</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Reject this submission?")) {
                                    onUpdateSubmissionStatus(sub.id, "rejected");
                                  }
                                }}
                                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-[10px] px-3 py-1.5 rounded transition flex items-center space-x-1"
                              >
                                <X className="w-3 h-3 text-red-500" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider border ${
                              sub.status === "approved" 
                                ? "bg-green-950 text-green-400 border-green-800" 
                                : "bg-red-950 text-red-400 border-red-800"
                            }`}>
                              {sub.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-neutral-950/80 p-3 rounded border border-neutral-850 text-xs text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap">
                        {sub.summary}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-850/60 pt-2.5">
                        <span>Submitted by Advocate: <strong className="text-neutral-400">{sub.submittedBy}</strong></span>
                        <span>Contact: <strong className="text-neutral-400">{sub.email}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DATABASE STATUS & SCHEMA COPIER */}
          {activeTab === "database" && (
            <div className="space-y-6" id="panel-database-status">
              <div className="border-b border-neutral-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <DatabaseZap className="w-5 h-5 text-red-500" />
                  Supabase Real-time Cloud Database
                </h2>
                <p className="text-xs text-neutral-400">
                  Connect your Spark Law instance to a production-ready PostgreSQL engine powered by Supabase.
                </p>
              </div>

              {/* Status Indicator Card */}
              <div className={`p-6 rounded-xl border ${
                isSupabaseConfigured 
                  ? lastSupabaseError
                    ? "bg-rose-950/20 border-rose-800/60 text-rose-300"
                    : "bg-green-950/20 border-green-800/60 text-green-300" 
                  : "bg-amber-950/20 border-amber-800/60 text-amber-300"
              } space-y-3`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    isSupabaseConfigured 
                      ? lastSupabaseError 
                        ? "bg-rose-500 animate-pulse" 
                        : "bg-green-500 animate-pulse" 
                      : "bg-amber-500"
                  }`} />
                  <span className="font-extrabold text-sm uppercase tracking-wider font-mono">
                    {isSupabaseConfigured 
                      ? lastSupabaseError 
                        ? "STATUS: SCHEMA CONFIGURATION REQUIRED" 
                        : "STATUS: LIVE CLOUD SYNC" 
                      : "STATUS: LOCAL FALLBACK ENGINE"}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                  {isSupabaseConfigured 
                    ? lastSupabaseError
                      ? `Your Supabase keys are configured successfully, but queries are currently failing with the error: "${lastSupabaseError}". This usually means your database tables have not been created yet in the Supabase database. Please copy the SQL Schema script below, go to your Supabase project's SQL Editor, paste and click "Run" to initialize all required tables.`
                      : "Spark Law is successfully linked to your live Supabase cloud backend! All published reports, advocate pitches, and team login accounts are synchronizing in real-time."
                    : "The system is currently running on the local storage sandbox fallback because API environment credentials are not declared in Settings. Don't worry! All published legal updates, writer accounts, and submissions will still persist completely fine within your browser cache, and will migrate safely once configured."}
                </p>
              </div>

              {/* Setup Guide */}
              <div className="bg-neutral-900 rounded-lg p-5 border border-neutral-800 space-y-4">
                <h3 className="font-bold text-sm text-neutral-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-500" />
                  How to setup Supabase Cloud:
                </h3>
                <ol className="list-decimal list-inside text-xs text-neutral-400 space-y-2 leading-relaxed">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-red-400 hover:underline">supabase.com</a> and spin up a new free project.</li>
                  <li>Go to your project's <strong>Settings &gt; API</strong> dashboard to locate the public <strong>URL</strong> and <strong>anon/public Key</strong>.</li>
                  <li>Click on <strong>Settings</strong> at the top right of this editor, and input these variables:
                    <div className="bg-neutral-950 p-2.5 rounded font-mono text-[11px] text-red-400 mt-2 space-y-1">
                      <p>VITE_SUPABASE_URL = &quot;your-project-url.supabase.co&quot;</p>
                      <p>VITE_SUPABASE_ANON_KEY = &quot;your-anon-key-string&quot;</p>
                    </div>
                  </li>
                  <li>Copy the SQL script below and paste it into the <strong>SQL Editor</strong> tab in your Supabase Dashboard, then click <strong>Run</strong>:</li>
                </ol>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-neutral-500">
                    <span>Database Bootstrap SQL Schema:</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                        alert("SQL Schema copied to clipboard!");
                      }}
                      className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold bg-neutral-950 px-2 py-1 rounded border border-neutral-800"
                    >
                      Copy SQL
                    </button>
                  </div>
                  <pre className="bg-neutral-950 text-neutral-400 text-[11px] font-mono p-4 rounded-lg overflow-x-auto h-48 border border-neutral-800 leading-relaxed">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
