import React from "react";
import { Calendar, Eye, Bookmark, Award, FileText, ChevronRight } from "lucide-react";
import { LegalArticle } from "../types";
import { motion } from "motion/react";

interface ArticleCardProps {
  key?: string | number;
  article: LegalArticle;
  onSelect: (id: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (e: any, id: string) => void;
  isHero?: boolean;
}

export default function ArticleCard({
  article,
  onSelect,
  isBookmarked,
  onToggleBookmark,
  isHero = false
}: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  if (isHero) {
    return (
      <motion.article
        id={`article-hero-${article.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => onSelect(article.id)}
        className="group relative cursor-pointer bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Hero Image */}
        <div className="lg:col-span-7 relative overflow-hidden aspect-[16/10] lg:aspect-auto min-h-[300px] lg:h-full bg-neutral-100">
          <img
            src={article.imageUrl}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
          
          {/* Tags over Image (Floating) */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <span className="bg-red-800 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              {article.category}
            </span>
            {article.isBreaking && (
              <span className="bg-amber-500 text-neutral-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse shadow-md">
                Breaking Update
              </span>
            )}
          </div>
        </div>

        {/* Hero Content */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white relative">
          <div className="space-y-4">
            {/* Sub-Category and Date */}
            <div className="flex items-center space-x-3 text-xs font-semibold text-neutral-500">
              <span className="text-red-800 tracking-wider uppercase">{article.subcategory || "Legal News"}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 leading-tight group-hover:text-red-800 transition-colors">
              {article.title}
            </h2>

            {/* Summary */}
            <p className="text-sm text-neutral-600 leading-relaxed font-sans line-clamp-3">
              {article.summary}
            </p>

            {/* Law Docket Box if present */}
            {article.caseDetails && (
              <div className="bg-neutral-50 border-l-4 border-red-800 p-3.5 rounded-r-lg space-y-1 text-xs">
                <p className="font-extrabold text-neutral-800 line-clamp-1 italic">
                  {article.caseDetails.caseName}
                </p>
                <div className="flex justify-between text-neutral-500 font-mono text-[10px] pt-1">
                  <span>Citation: {article.caseDetails.citation}</span>
                  <span>Court: {article.category}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between border-t border-neutral-100 pt-6 mt-6">
            <div className="flex items-center space-x-4 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-700">By {article.author}</span>
              <span className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{article.views.toLocaleString()} views</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => onToggleBookmark(e, article.id)}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  isBookmarked
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-white hover:bg-neutral-50 text-neutral-400 border-neutral-200"
                }`}
                title="Bookmark article"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-red-800" : ""}`} />
              </button>
              <span className="text-red-800 group-hover:translate-x-1.5 transition-transform">
                <ChevronRight className="w-6 h-6 stroke-[3px]" />
              </span>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      id={`article-${article.id}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(article.id)}
      className="group cursor-pointer bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      {/* Article Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 shrink-0">
        <img
          src={article.imageUrl}
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="bg-red-800 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
            {article.category}
          </span>
          {article.isBreaking && (
            <span className="bg-amber-500 text-neutral-900 text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              Breaking
            </span>
          )}
        </div>
        <button
          onClick={(e) => onToggleBookmark(e, article.id)}
          className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md shadow-md transition-all z-10 cursor-pointer ${
            isBookmarked
              ? "bg-red-800 text-white"
              : "bg-white/85 hover:bg-white text-neutral-600"
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-white" : ""}`} />
        </button>
      </div>

      {/* Article text body */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div className="space-y-3">
          {/* Subcategory & date */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
            <span className="text-red-800 uppercase tracking-wider">{article.subcategory || "Updates"}</span>
            <span>{formattedDate}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-neutral-900 leading-snug group-hover:text-red-800 transition-colors line-clamp-2">
            {article.title}
          </h3>

          {/* Case Detail line summary if SC or HC */}
          {article.caseDetails ? (
            <div className="bg-neutral-50/80 border-l-2 border-red-800 p-2 rounded-r-md text-[11px] font-sans">
              <span className="font-extrabold text-neutral-700 italic block line-clamp-1">
                {article.caseDetails.caseName}
              </span>
              <span className="text-neutral-500 block text-[10px] font-mono mt-0.5">
                {article.caseDetails.citation}
              </span>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              {article.summary}
            </p>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-4 text-[11px] text-neutral-500 font-medium">
          <span>By {article.author}</span>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{article.views.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
