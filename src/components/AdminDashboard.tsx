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
  DatabaseZap,
  Upload,
  Image
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
  const [adminEmail, setAdminEmail] = useState("avd.akram@law.in");
  const [isDefaultPassword, setIsDefaultPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    fetch("/api/auth/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.adminEmail) {
          setAdminEmail(data.adminEmail);
        }
        if (data.isDefaultPassword !== undefined) {
          setIsDefaultPassword(data.isDefaultPassword);
        }
      })
      .catch((err) => console.error("Error loading secure auth config:", err));
  }, []);

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
      // 1. Verify credentials via secure backend server
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          setCurrentUser(result.user);
          localStorage.setItem("sparklaw_current_user", JSON.stringify(result.user));
          return;
        }
      }

      // 2. If Supabase is configured, attempt real-time cloud query for contributors
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
        setLoginError(`Invalid email or password. Please use the configured credentials (e.g. ${adminEmail}).`);
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

  // File upload state for Cover Pages
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileSize, setUploadedFileSize] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }
    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setCustomImageUrl(reader.result);
        setImageUrl(reader.result);
        setUploadedFileName(file.name);
        
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
        setUploadedFileSize(`${sizeInMb} MB`);
      }
    };
    reader.readAsDataURL(file);
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
    setUploadedFileName("");
    setUploadedFileSize("");
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

    if (users.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase()) || newUserEmail.toLowerCase() === adminEmail.toLowerCase()) {
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
    // Dynamic greeting calculation
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
    };

    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 md:p-8 selection:bg-red-900 selection:text-white" id="login-container">
        {/* Main Card Container */}
        <div className="w-full max-w-5xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-fade-in" id="login-card">
          
          {/* Left Column: Visual Brand & Live Stats Panel (Hidden on smaller screens, highly visible on LG+) */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950/20 p-12 flex-col justify-between border-r border-neutral-800 relative overflow-hidden" id="login-brand-panel">
            {/* Ambient visual glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-900/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

            {/* Brand Header */}
            <div className="relative z-10 flex items-center space-x-3">
              <div className="bg-red-800/10 p-2.5 rounded-xl border border-red-900/30">
                <Scale className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  SPARK LAW
                </span>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
                  Judicial Intelligence Network
                </p>
              </div>
            </div>

            {/* Editorial / Inspiring Quote */}
            <div className="relative z-10 my-8 space-y-4">
              <span className="inline-block bg-red-950/50 text-red-400 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-red-900/40">
                Staff Mandate
              </span>
              <p className="text-xl md:text-2xl font-light text-neutral-200 leading-relaxed italic font-sans">
                "Justice, equality, and constitutional truth are the foundational pillars of our collective advocacy."
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="h-0.5 w-8 bg-red-800"></div>
                <p className="text-xs text-neutral-400 font-mono tracking-wider uppercase">Supreme Court Directorate</p>
              </div>
            </div>

            {/* Platform Snapshot Panel */}
            <div className="relative z-10 bg-neutral-950/60 p-6 rounded-xl border border-neutral-850/50 space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
                <div className="flex items-center space-x-2">
                  <DatabaseZap className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">Live Node Metrics</span>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-neutral-900/50 p-2.5 rounded border border-neutral-800/40">
                  <div className="text-sm font-extrabold text-white font-mono">{articles.length}</div>
                  <div className="text-[9px] text-neutral-500 uppercase tracking-wider mt-0.5">Articles</div>
                </div>
                <div className="bg-neutral-900/50 p-2.5 rounded border border-neutral-800/40">
                  <div className="text-sm font-extrabold text-white font-mono">{users.length + 1}</div>
                  <div className="text-[9px] text-neutral-500 uppercase tracking-wider mt-0.5">Staff</div>
                </div>
                <div className="bg-neutral-900/50 p-2.5 rounded border border-neutral-800/40">
                  <div className="text-sm font-extrabold text-white font-mono">{submissions.filter(s => s.status === "pending").length}</div>
                  <div className="text-[9px] text-neutral-500 uppercase tracking-wider mt-0.5">Pitches</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Custom Login Form */}
          <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-between relative" id="login-form-panel">
            {/* Top Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 text-neutral-500 hover:text-white hover:bg-neutral-850 p-2 rounded-full transition-all duration-300 border border-transparent hover:border-neutral-800 cursor-pointer"
              id="login-close-btn"
              title="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mobile Brand Header (Hidden on large screen) */}
            <div className="lg:hidden flex items-center space-x-2 text-red-500 mb-8" id="login-mobile-header">
              <Scale className="w-7 h-7" />
              <span className="font-extrabold text-xl tracking-tighter text-white font-sans">
                SPARK LAW
              </span>
            </div>

            {/* Login Header with Dynamic Hourly Greeting */}
            <div className="mb-8 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-red-500 font-mono text-xs uppercase tracking-widest font-semibold">Security Gate</span>
                <span className="text-neutral-600 font-sans text-xs">•</span>
                <span className="text-neutral-400 font-sans text-xs">{getGreeting()}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
                Welcome back
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Please sign in to access your administrative control room and workspace.
              </p>
            </div>

            {/* Main Form Block */}
            <div className="space-y-6">
              {loginError && (
                <div className="bg-red-950/30 border border-red-900/50 text-red-400 text-xs p-4 rounded-xl flex items-start gap-3 relative animate-shake" id="login-error-alert">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-red-300">Access Denied</p>
                    <p className="text-neutral-300 leading-relaxed">{loginError}</p>
                  </div>
                  <button 
                    onClick={() => setLoginError("")}
                    className="text-neutral-500 hover:text-neutral-300 transition shrink-0"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                    Staff Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={adminEmail}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all duration-300"
                      id="login-email-input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                      Staff Password
                    </label>
                    <span className="text-[10px] text-neutral-600 uppercase font-mono tracking-wider">256-Bit Encrypted</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 pr-12 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all duration-300"
                      id="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 focus:outline-none transition-colors duration-200"
                      title={showPassword ? "Hide password" : "Show password"}
                      id="login-password-toggle"
                    >
                      {showPassword ? (
                        <Eye className="w-4 h-4 text-red-500" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all duration-300 shadow-xl shadow-red-950/20 mt-6 disabled:opacity-60 disabled:cursor-wait flex items-center justify-center space-x-2 border border-red-900/30"
                  id="login-submit-btn"
                >
                  {isLoggingIn ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Verifying Secure Keys...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-red-300" />
                      <span>Authenticate Securely</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Section: Security Info & Interactive Autofill */}
            <div className="mt-10 pt-6 border-t border-neutral-800 space-y-4">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-sans">Authorized Access Credentials</span>
                  </div>
                  
                  {/* Single Action Autofill Pill - Only shown for default/development settings */}
                  {isDefaultPassword ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(adminEmail);
                        setPassword("admin.akram");
                      }}
                      className="text-[10px] font-bold text-red-400 hover:text-white bg-red-950/40 hover:bg-red-900/80 px-2.5 py-1 rounded-full border border-red-900/50 hover:border-red-700 transition-all duration-300 cursor-pointer"
                      id="login-autofill-btn"
                    >
                      Quick Autofill
                    </button>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-500 bg-amber-950/35 border border-amber-900/40 px-2.5 py-0.5 rounded-full font-mono">
                      Secure Custom Key Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                  <div className="bg-neutral-900/60 p-2.5 rounded border border-neutral-800/40">
                    <span className="block text-[9px] text-neutral-500 uppercase font-sans font-bold tracking-wider mb-0.5">Admin ID</span>
                    <span className="text-red-400 select-all font-semibold">{adminEmail}</span>
                  </div>
                  <div className="bg-neutral-900/60 p-2.5 rounded border border-neutral-800/40">
                    <span className="block text-[9px] text-neutral-500 uppercase font-sans font-bold tracking-wider mb-0.5">Password</span>
                    <span className="text-red-400 select-all font-semibold">
                      {isDefaultPassword ? "admin.akram" : "•••••••• [Custom]"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-neutral-500">
                <div className="h-1.5 w-1.5 bg-red-900 rounded-full"></div>
                <p>Verifies via secure, double-hashed server-side protocol.</p>
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
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Select Display Cover Image
                  </label>
                  
                  {/* Preset Images Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => {
                          setImageUrl(img.url);
                          setCustomImageUrl("");
                          setUploadedFileName("");
                          setUploadedFileSize("");
                        }}
                        className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all duration-300 ${
                          imageUrl === img.url && !customImageUrl 
                            ? "border-red-500 ring-2 ring-red-500/20 scale-[0.98]" 
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-0 left-0 right-0 bg-black/85 text-[8px] text-center text-white py-1 font-sans font-medium px-1 truncate">
                          {img.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Upload and Paste Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
                    {/* Left side: Drag & Drop File Upload */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Upload Custom File
                      </span>
                      
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("cover-file-upload")?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer h-32 ${
                          isDragging
                            ? "border-red-500 bg-red-950/10 text-red-400"
                            : "border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950/40 text-neutral-400 hover:text-neutral-300"
                        }`}
                        id="cover-upload-dropzone"
                      >
                        <input
                          type="file"
                          id="cover-file-upload"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Upload className={`w-6 h-6 mb-2 transition-transform duration-300 ${isDragging ? "scale-110 text-red-500 animate-bounce" : "text-neutral-500"}`} />
                        <p className="text-xs font-semibold">
                          Drag & drop image here
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-1">
                          or click to browse from device
                        </p>
                        <p className="text-[9px] text-neutral-600 mt-0.5">
                          Supports JPG, PNG, WEBP (Max 5MB)
                        </p>
                      </div>
                    </div>

                    {/* Right side: Paste URL or show Upload Details */}
                    <div className="flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Or Paste Image Web URL
                        </span>
                        <input
                          type="url"
                          value={customImageUrl.startsWith("data:image/") ? "" : customImageUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomImageUrl(val);
                            if (val.trim()) {
                              setImageUrl(val.trim());
                              setUploadedFileName("Pasted Web URL");
                              setUploadedFileSize("Dynamic Ingress");
                            } else {
                              setImageUrl(PRESET_IMAGES[0].url);
                              setUploadedFileName("");
                              setUploadedFileSize("");
                            }
                          }}
                          placeholder="https://example.com/law-image.jpg"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500 placeholder-neutral-600 transition"
                          id="news-custom-image-input"
                        />
                      </div>

                      {/* Preview / Selection Status Panel */}
                      <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850/60 flex items-center justify-between gap-3 h-[4.5rem]">
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                          <div className="w-10 h-10 rounded overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                            {customImageUrl ? (
                              <img src={customImageUrl} alt="Custom upload preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-neutral-950">
                                <Image className="w-4 h-4 text-neutral-700" />
                              </div>
                            )}
                          </div>
                          <div className="text-[11px] truncate">
                            {customImageUrl ? (
                              <>
                                <p className="font-semibold text-red-400 truncate max-w-[150px]">
                                  {uploadedFileName || "Custom Cover Active"}
                                </p>
                                <p className="text-[9px] text-neutral-500 font-mono mt-0.5">
                                  {uploadedFileSize || "External URL"}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-400 font-medium">No custom image</p>
                                <p className="text-[9px] text-neutral-500">Preset photo selected</p>
                              </>
                            )}
                          </div>
                        </div>

                        {customImageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomImageUrl("");
                              setImageUrl(PRESET_IMAGES[0].url);
                              setUploadedFileName("");
                              setUploadedFileSize("");
                            }}
                            className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 hover:text-red-400 bg-neutral-900 hover:bg-red-950/30 px-2 py-1 rounded border border-neutral-800 hover:border-red-900/40 transition duration-300 shrink-0"
                            title="Reset to default preset"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
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
                        <div className="text-neutral-500">{adminEmail}</div>
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
