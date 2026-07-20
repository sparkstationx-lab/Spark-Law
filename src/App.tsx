import React, { useState, useEffect } from "react";
import { MOCK_ARTICLES, CATEGORIES } from "./data";
import { LegalArticle, LawUpdateSubmission, PortalUser } from "./types";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ArticleCard from "./components/ArticleCard";
import ArticleDetailView from "./components/ArticleDetailView";
import SubmitLawUpdateModal from "./components/SubmitLawUpdateModal";
import BookmarksView from "./components/BookmarksView";
import { AdminDashboard } from "./components/AdminDashboard";
import { Bell, Scale, HelpCircle, BookOpen, AlertTriangle, ChevronRight, CornerDownRight, Award, Database, DatabaseZap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, isSupabaseConfigured, lastSupabaseError, SUPABASE_SQL_SCHEMA } from "./lib/supabase";

export default function App() {
  // Navigation & Filtering state
  const [currentCategory, setCurrentCategory] = useState<string>("All Updates");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"news" | "bookmarks">("news");
  
  // Modals & Panels state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);

  // Dynamic news articles state
  const [articles, setArticles] = useState<LegalArticle[]>([]);

  // Team Contributors state
  const [users, setUsers] = useState<PortalUser[]>([]);

  // Bookmarking state (backed up to localStorage for durable client persistence)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("sparklaw_bookmarks") || localStorage.getItem("livelaw_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  // Submitted cases state
  const [submissions, setSubmissions] = useState<LawUpdateSubmission[]>([]);

  // Database loading state
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  // Load data from db (Supabase or Local Storage fallback) on mount
  useEffect(() => {
    async function loadData() {
      setIsLoadingDb(true);
      try {
        const dbArticles = await db.getArticles();
        const dbContributors = await db.getContributors();
        const dbSubmissions = await db.getSubmissions();

        // Populate articles
        if (dbArticles.length > 0) {
          setArticles(dbArticles);
        } else {
          // If both Supabase and localStorage are clean, bootstrap with our mock articles
          setArticles(MOCK_ARTICLES);
          // Async bootstrap database so subsequent reloads have it
          for (const art of MOCK_ARTICLES) {
            await db.saveArticle(art);
          }
        }

        // Populate contributors
        setUsers(dbContributors);

        // Populate submissions
        if (dbSubmissions.length > 0) {
          setSubmissions(dbSubmissions);
        } else {
          const defaultSubmissions: LawUpdateSubmission[] = [
            {
              id: "sub-1",
              title: "Advocates Association Urges Allocation of Digital Infrastructure Grants for Mofussil Bar Rooms",
              court: "Bombay High Court",
              caseNumber: "Suo Motu W.P. No. 12/2026",
              bench: "Justice Devendra Kumar Upadhyaya",
              summary: "Requesting immediate installation of high-speed optical fiber connectivity and e-filing terminals across rural and semi-urban court bar associations.",
              submittedBy: "Rajesh S. Patil (Adv.)",
              email: "patil.associates@bar.in",
              status: "approved",
              submittedAt: "2026-07-04T12:00:00Z"
            },
            {
              id: "sub-2",
              title: "Environment Trust Challenges Infrastructure Excavation in Declared Reserve Forest Zones",
              court: "Delhi High Court",
              caseNumber: "W.P.(C) PIL No. 240/2026",
              bench: "Acting Chief Justice Manmohan",
              summary: "PIL seeking standard environmental impact assessment auditing for underpass and cable trenches running adjacent to protected ridge lines.",
              submittedBy: "Meera Sen (Adv.)",
              email: "meera.sen@greenlaw.org",
              status: "pending",
              submittedAt: "2026-07-05T01:30:00Z"
            }
          ];
          setSubmissions(defaultSubmissions);
          // Async bootstrap submissions
          for (const s of defaultSubmissions) {
            await db.saveSubmission(s);
          }
        }
      } catch (error) {
        console.error("Error initializing Spark Law Database:", error);
      } finally {
        setSupabaseError(lastSupabaseError);
        setIsLoadingDb(false);
      }
    }
    loadData();
  }, []);

  // Sync bookmark state to localStorage (user-specific local storage preference)
  useEffect(() => {
    localStorage.setItem("sparklaw_bookmarks", JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Handlers
  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    setActiveTab("news");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const handleCardToggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Stop from triggering card click select
    handleToggleBookmark(id);
  };

  const handleClearAllBookmarks = () => {
    setBookmarkedIds([]);
  };

  const handleSubmission = async (newSub: Omit<LawUpdateSubmission, "id" | "status" | "submittedAt">) => {
    const fullSubmission: LawUpdateSubmission = {
      ...newSub,
      id: `sub-${Date.now()}`,
      status: "pending",
      submittedAt: new Date().toISOString()
    };
    
    // Save to database
    await db.saveSubmission(fullSubmission);
    
    // Update local state
    setSubmissions((prev) => [fullSubmission, ...prev]);
  };

  // Filter articles based on Category AND Search Query
  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      currentCategory === "All Updates" || article.category === currentCategory;

    const matchesSearch =
      searchQuery.trim() === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.caseDetails?.caseName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.caseDetails?.citation || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Find trending articles sorted by views
  const trendingArticles = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  // Find breaking news items for the ticker
  const breakingNews = articles.filter((art) => art.isBreaking);

  // Get current active article for details view
  const activeArticle = articles.find((art) => art.id === selectedArticleId);

  if (showAdmin) {
    return (
      <AdminDashboard
        articles={articles}
        onAddArticle={async (newArt) => {
          await db.saveArticle(newArt);
          setArticles(prev => [newArt, ...prev]);
        }}
        onDeleteArticle={async (id) => {
          await db.deleteArticle(id);
          setArticles(prev => prev.filter(art => art.id !== id));
        }}
        submissions={submissions}
        onUpdateSubmissionStatus={async (id, status) => {
          await db.updateSubmissionStatus(id, status);
          setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        }}
        users={users}
        onAddUser={async (newUser) => {
          await db.saveContributor(newUser);
          setUsers(prev => [...prev, newUser]);
        }}
        onDeleteUser={async (id) => {
          await db.deleteContributor(id);
          setUsers(prev => prev.filter(u => u.id !== id));
        }}
        onClose={() => setShowAdmin(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/50 flex flex-col font-sans selection:bg-red-800 selection:text-white" id="root-layout">
      {/* Dynamic Navigation Header */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSelectedArticleId(null);
          setActiveTab("news");
        }}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setSelectedArticleId(null);
          setActiveTab("news");
        }}
        bookmarkCount={bookmarkedIds.length}
        onViewBookmarks={() => {
          setActiveTab("bookmarks");
          setSelectedArticleId(null);
        }}
        onGoHome={() => {
          setCurrentCategory("All Updates");
          setSelectedArticleId(null);
          setActiveTab("news");
          setSearchQuery("");
        }}
        activeTab={activeTab}
        onAdminOpen={() => setShowAdmin(true)}
      />

      {/* Supabase Connection Status Banner */}
      <div className={`py-2 px-4 text-center text-xs font-semibold border-b flex flex-wrap items-center justify-center gap-x-2 gap-y-1 transition-colors ${
        isSupabaseConfigured
          ? supabaseError
            ? "bg-rose-50 text-rose-800 border-rose-100 animate-pulse"
            : "bg-emerald-50 text-emerald-800 border-emerald-100"
          : "bg-amber-50 text-amber-800 border-amber-100"
      }`} id="supabase-status-bar">
        {isSupabaseConfigured ? (
          supabaseError ? (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Database Query Error: {supabaseError} (Tables need setup).</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                  setCopiedSchema(true);
                  setTimeout(() => setCopiedSchema(false), 3000);
                }}
                className="bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded text-[11px] font-extrabold cursor-pointer transition-colors shadow-sm"
              >
                {copiedSchema ? "✓ Copied Setup Script!" : "📋 Copy SQL Setup Script"}
              </button>
              <button
                onClick={() => {
                  setShowAdmin(true);
                }}
                className="underline text-red-800 hover:text-red-700 font-extrabold cursor-pointer"
              >
                Open SQL Guide
              </button>
            </>
          ) : (
            <>
              <DatabaseZap className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
              <span>Spark Law Database: Connected to Real-time Supabase Cloud!</span>
            </>
          )
        ) : (
          <>
            <Database className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Database: Running in Local Fallback Cache.</span>
            <button
              onClick={() => {
                setShowAdmin(true);
              }}
              className="underline text-red-800 hover:text-red-700 font-extrabold ml-1 cursor-pointer"
            >
              Connect to Supabase Cloud
            </button>
          </>
        )}
      </div>

      {/* Breaking News Ticker Banner */}
      {breakingNews.length > 0 && (
        <div className="bg-red-50 border-b border-red-100 py-2.5 overflow-hidden shadow-sm shrink-0" id="breaking-ticker-banner">
          <div className="max-w-7xl mx-auto px-4 flex items-center space-x-3 sm:px-6 lg:px-8">
            <span className="bg-red-800 text-white font-extrabold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded shrink-0 flex items-center space-x-1 shadow-sm">
              <Bell className="w-3 h-3 text-white animate-bounce shrink-0" />
              <span>Flash News</span>
            </span>
            <div className="flex-1 overflow-hidden relative h-5">
              <div className="absolute flex space-x-8 animate-marquee whitespace-nowrap text-xs font-bold text-neutral-800">
                {breakingNews.map((news) => (
                  <button
                    key={news.id}
                    onClick={() => handleSelectArticle(news.id)}
                    className="hover:text-red-800 hover:underline transition-all text-left inline-flex items-center space-x-1 bg-transparent cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-red-600 shrink-0" />
                    <span className="italic font-extrabold text-red-900 mr-1">
                      [{news.caseDetails?.citation || "SC Order"}]
                    </span>
                    <span>{news.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Layout Wrapper */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8" id="primary-content-grid">
        <AnimatePresence mode="wait">
          {activeTab === "bookmarks" ? (
            /* BOOKMARKS PAGE VIEW */
            <BookmarksView
              articles={articles}
              bookmarkIds={bookmarkedIds}
              onSelectArticle={handleSelectArticle}
              onToggleBookmark={handleCardToggleBookmark}
              onClearAll={handleClearAllBookmarks}
              onBack={() => setActiveTab("news")}
            />
          ) : selectedArticleId && activeArticle ? (
            /* DETAILED SINGLE-ARTICLE READING VIEW */
            <ArticleDetailView
              article={activeArticle}
              onBack={() => setSelectedArticleId(null)}
              isBookmarked={bookmarkedIds.includes(activeArticle.id)}
              onToggleBookmark={handleToggleBookmark}
            />
          ) : (
            /* STANDARD NEWS PORTAL DASHBOARD FEED VIEW */
            <div className="space-y-6">
              {/* Filter / Search Header indicators */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-neutral-200">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-5 h-5 text-red-800" />
                    <h2 className="text-xl font-black text-neutral-900 tracking-tight font-sans uppercase">
                      {currentCategory} Dispatch
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">
                    Showing latest legal alerts, statutory notifications, and orders.
                  </p>
                </div>

                {searchQuery && (
                  <span className="text-xs font-semibold text-neutral-600 bg-neutral-200/60 px-3 py-1.5 rounded-full inline-block">
                    Filtered by query: <strong className="text-neutral-900 italic">"{searchQuery}"</strong> ({filteredArticles.length} found)
                  </span>
                )}
              </div>

              {/* Feed Grid (Left column articles, Right column widgets) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side Content - Legal Article Feed */}
                <div className="lg:col-span-8 space-y-6">
                  {articles.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-neutral-200 rounded-xl p-8 space-y-4 shadow-sm" id="empty-portal-state">
                      <div className="bg-red-50 text-red-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Scale className="w-8 h-8 text-red-800" />
                      </div>
                      <div className="space-y-2 max-w-md mx-auto">
                        <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">
                          Welcome to Spark Law
                        </h3>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          All dummy news has been successfully cleared as requested! The legal news database is currently fresh and ready for custom publications.
                        </p>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 font-sans text-xs text-left space-y-2 text-neutral-700">
                          <p className="font-bold text-neutral-900 flex items-center gap-1">
                            <Award className="w-4 h-4 text-amber-600 shrink-0" />
                            How to publish news:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 text-neutral-600">
                            <li>Click on <strong className="text-red-800 font-semibold cursor-pointer" onClick={() => setShowAdmin(true)}>Staff Portal</strong> in the top header.</li>
                            <li>Log in using the administrator ID: <code className="bg-neutral-200 px-1 rounded text-red-800 font-mono">avd.akram@law.in</code> and your secure staff password.</li>
                            <li>Add articles, register contributors, and approve advocate submissions instantly!</li>
                          </ul>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAdmin(true)}
                        className="px-5 py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer inline-flex items-center space-x-2"
                        id="empty-staff-portal-redirect"
                      >
                        <span>Open Staff Portal</span>
                      </button>
                    </div>
                  ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-sm">
                      <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-base font-extrabold text-neutral-950">
                          No matching legal updates found
                        </p>
                        <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                          We couldn't locate any rulings or reviews matching your criteria. Try resetting your search filter or selecting a different court.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentCategory("All Updates");
                        }}
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Highlighted Lead Hero Article (If no search query/filter is active) */}
                      {!searchQuery && filteredArticles.length > 0 && (
                        <ArticleCard
                          article={filteredArticles[0]}
                          onSelect={handleSelectArticle}
                          isBookmarked={bookmarkedIds.includes(filteredArticles[0].id)}
                          onToggleBookmark={handleCardToggleBookmark}
                          isHero={true}
                        />
                      )}

                      {/* Standard Grid of remaining updates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {(searchQuery ? filteredArticles : filteredArticles.slice(1)).map((article) => (
                          <ArticleCard
                            key={article.id}
                            article={article}
                            onSelect={handleSelectArticle}
                            isBookmarked={bookmarkedIds.includes(article.id)}
                            onToggleBookmark={handleCardToggleBookmark}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side Content - Side widgets (Trending, Submissions, Newsletter) */}
                <div className="lg:col-span-4">
                  <Sidebar
                    trendingArticles={trendingArticles}
                    onSelectArticle={handleSelectArticle}
                    recentSubmissions={submissions}
                    onAdminOpen={() => setShowAdmin(true)}
                  />
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white border-t border-neutral-800 mt-12 py-12 shrink-0" id="portal-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo Brand info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="bg-red-800 text-white p-1.5 rounded">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">SPARK LAW PORTAL</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Spark Law Portal is an authoritative independent judicial reporting agency. We provide certified summaries of legal decrees, supreme court writ arguments, and high-court dockets for practitioners, students, and legal scholars in India.
            </p>
            <p className="text-[10px] text-neutral-500 font-medium">
              © {new Date().getFullYear()} Legal News Portal. All Rights Reserved. Built with precision for digital jurisprudence.
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-4 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">
              Judiciary Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400">
              <button 
                onClick={() => { setCurrentCategory("Supreme Court"); setSelectedArticleId(null); setActiveTab("news"); }}
                className="hover:text-red-400 text-left transition-colors font-medium cursor-pointer"
              >
                Supreme Court
              </button>
              <button 
                onClick={() => { setCurrentCategory("High Courts"); setSelectedArticleId(null); setActiveTab("news"); }}
                className="hover:text-red-400 text-left transition-colors font-medium cursor-pointer"
              >
                High Courts
              </button>
              <button 
                onClick={() => { setCurrentCategory("Corporate Law"); setSelectedArticleId(null); setActiveTab("news"); }}
                className="hover:text-red-400 text-left transition-colors font-medium cursor-pointer"
              >
                Corporate Law
              </button>
              <button 
                onClick={() => { setCurrentCategory("IBC & Tax"); setSelectedArticleId(null); setActiveTab("news"); }}
                className="hover:text-red-400 text-left transition-colors font-medium cursor-pointer"
              >
                Insolvency & Tax
              </button>
              <button 
                onClick={() => { setCurrentCategory("Law Schools"); setSelectedArticleId(null); setActiveTab("news"); }}
                className="hover:text-red-400 text-left transition-colors font-medium cursor-pointer"
              >
                Law Schools
              </button>
              <button 
                onClick={() => { setCurrentCategory("Opinions & Columns"); setSelectedArticleId(null); setActiveTab("news"); }}
                className="hover:text-red-400 text-left transition-colors font-medium cursor-pointer"
              >
                Editorials
              </button>
            </div>
          </div>

          {/* Contact and terms */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">
              Contact & Submissions
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Have questions regarding case audits or looking to contribute? Get in touch with our Supreme Court press room.
            </p>
            <div className="text-[11px] text-neutral-500 font-semibold space-y-1">
              <p>Email: editors@sparklaw.in</p>
              <p>New Delhi Press Guild, India</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Case Submission Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <SubmitLawUpdateModal
            isOpen={isSubmitModalOpen}
            onClose={() => setIsSubmitModalOpen(false)}
            onSubmit={handleSubmission}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
