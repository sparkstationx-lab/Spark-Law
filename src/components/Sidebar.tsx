import React, { useState } from "react";
import { TrendingUp, Send, CheckCircle2, Award, Mail, Sparkles, Scale, Info, Check } from "lucide-react";
import { LegalArticle, LawUpdateSubmission } from "../types";
import { motion } from "motion/react";

interface SidebarProps {
  trendingArticles: LegalArticle[];
  onSelectArticle: (id: string) => void;
  recentSubmissions: LawUpdateSubmission[];
  onSubmitUpdateOpen: () => void;
}

export default function Sidebar({
  trendingArticles,
  onSelectArticle,
  recentSubmissions,
  onSubmitUpdateOpen
}: SidebarProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <aside className="space-y-6" id="right-sidebar">
      {/* Trending / Most Read Box */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-neutral-100 pb-3 mb-4">
          <TrendingUp className="w-4 h-4 text-red-800" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-800">
            Trending Legal News
          </h3>
        </div>
        <div className="space-y-3.5">
          {trendingArticles.map((article, idx) => (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article.id)}
              className="group cursor-pointer flex items-start space-x-3.5 pb-3 border-b border-dashed border-neutral-100 last:border-0 last:pb-0"
            >
              <span className="text-lg font-black text-neutral-300 group-hover:text-red-800 transition-colors pt-0.5">
                0{idx + 1}
              </span>
              <div className="space-y-1">
                <span className="bg-red-50 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {article.category}
                </span>
                <h4 className="text-xs font-bold text-neutral-800 group-hover:text-red-800 transition-colors line-clamp-2 leading-relaxed">
                  {article.title}
                </h4>
                <p className="text-[10px] text-neutral-400 font-medium">
                  {article.views.toLocaleString()} reads
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Update Launcher CTA */}
      <div className="bg-gradient-to-br from-red-900 to-red-950 text-white rounded-xl p-5 shadow-md relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-800/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-red-700/10 rounded-full blur-lg pointer-events-none" />

        <div className="relative space-y-3.5">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <span className="bg-red-800 text-amber-400 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md">
              Lawyer Desk
            </span>
          </div>
          <h3 className="text-base font-extrabold tracking-tight">
            Have a case update or legal news scoop?
          </h3>
          <p className="text-xs text-red-200 leading-relaxed">
            Submit judicial briefs, court filings, and law updates directly to our editorial team for review and publishing.
          </p>
          <button
            onClick={onSubmitUpdateOpen}
            className="w-full py-2 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-neutral-900 font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Submit Update</span>
          </button>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      {recentSubmissions.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-neutral-100 pb-3 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-800">
              Community Law Updates
            </h3>
          </div>
          <div className="space-y-3">
            {recentSubmissions.slice(0, 3).map((sub) => (
              <div
                key={sub.id}
                className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500 font-mono">
                    {sub.court}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    sub.status === "approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {sub.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-800 line-clamp-1">
                  {sub.title}
                </h4>
                <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">
                  {sub.summary}
                </p>
                <div className="flex justify-between text-[9px] text-neutral-400 font-medium pt-1 border-t border-neutral-200/50">
                  <span>By Advocate {sub.submittedBy}</span>
                  <span>{new Date(sub.submittedAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter signup widget */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 shadow-sm">
        <div className="space-y-3">
          <div className="bg-red-100/60 p-2.5 rounded-lg w-fit text-red-800">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-neutral-900">
            Supreme Court Daily Brief
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Get authoritative analysis of landmark cases and legal trends delivered directly to your inbox every morning.
          </p>

          {subscribed ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg flex items-center space-x-2.5 font-semibold border border-emerald-200"
            >
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Subscription confirmed! Thank you.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <input
                type="email"
                required
                placeholder="Advocate/Law student email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-800 text-neutral-800"
              />
              <button
                type="submit"
                className="w-full py-2 bg-red-800 hover:bg-red-950 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Subscribe Now
              </button>
            </form>
          )}
          <span className="text-[9px] text-neutral-400 block text-center mt-1">
            Zero spam. Unsubscribe with one click.
          </span>
        </div>
      </div>

      {/* Stats Widget */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-1.5 text-neutral-700 text-xs font-bold uppercase tracking-wider">
          <Info className="w-4 h-4 text-neutral-400" />
          <span>Portal Database Status</span>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div className="p-3 bg-neutral-50 rounded-lg text-center">
            <span className="block text-xl font-extrabold text-red-800">12,450+</span>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase">SC Judgments</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg text-center">
            <span className="block text-xl font-extrabold text-red-800">24</span>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase">High Courts</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
