import React, { useState } from "react";
import { Bookmark, Search, Trash2, ArrowLeft, FolderHeart, Newspaper } from "lucide-react";
import { LegalArticle } from "../types";
import { motion } from "motion/react";
import ArticleCard from "./ArticleCard";

interface BookmarksViewProps {
  articles: LegalArticle[];
  bookmarkIds: string[];
  onSelectArticle: (id: string) => void;
  onToggleBookmark: (e: any, id: string) => void;
  onClearAll: () => void;
  onBack: () => void;
}

export default function BookmarksView({
  articles,
  bookmarkIds,
  onSelectArticle,
  onToggleBookmark,
  onClearAll,
  onBack
}: BookmarksViewProps) {
  const [localSearch, setLocalSearch] = useState("");

  const bookmarkedArticles = articles.filter(
    (art) => bookmarkIds.includes(art.id) &&
    (art.title.toLowerCase().includes(localSearch.toLowerCase()) ||
     art.summary.toLowerCase().includes(localSearch.toLowerCase()) ||
     (art.caseDetails?.caseName || "").toLowerCase().includes(localSearch.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="bookmarks-view-container"
    >
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-red-800 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to feed</span>
          </button>
          <div className="flex items-center space-x-2">
            <Bookmark className="w-6 h-6 text-red-800 fill-red-800" />
            <h2 className="text-xl font-extrabold text-neutral-900 font-sans tracking-tight">
              Your Bookmarked Legal Cases & Articles
            </h2>
          </div>
          <p className="text-xs text-neutral-500 font-medium">
            Keep track of vital constitutional disputes, citations, and professional updates offline.
          </p>
        </div>

        {bookmarkIds.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-red-800 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer w-fit"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Saved Cases</span>
          </button>
        )}
      </div>

      {bookmarkIds.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="bg-neutral-50 p-4 rounded-full w-fit mx-auto text-neutral-400 border border-dashed border-neutral-200">
            <FolderHeart className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-neutral-900 text-base">
              No Cases Bookmarked Yet
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
              Click the bookmark icon on any court update or law review article to save them here for offline reference.
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-red-800 hover:bg-red-950 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm cursor-pointer inline-flex items-center space-x-2"
          >
            <Newspaper className="w-4 h-4" />
            <span>Browse Case Feed</span>
          </button>
        </div>
      ) : (
        /* List or Grid of Bookmarks with search */
        <div className="space-y-6">
          <div className="relative flex items-center border border-neutral-200 bg-white rounded-xl px-4 py-3 shadow-sm max-w-md">
            <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search your bookmarked cases by name or title..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full text-sm focus:outline-none text-neutral-800 placeholder-neutral-400"
            />
          </div>

          {bookmarkedArticles.length === 0 ? (
            <p className="text-xs font-bold text-neutral-500 text-center py-4 bg-white border border-neutral-200 rounded-xl">
              No bookmarks matched "{localSearch}"
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookmarkedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onSelect={onSelectArticle}
                  isBookmarked={true}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
