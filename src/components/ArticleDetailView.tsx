import React, { useState } from "react";
import { ArrowLeft, Bookmark, Share2, Calendar, Eye, User, Scale, Check, Copy } from "lucide-react";
import { LegalArticle } from "../types";
import { motion } from "motion/react";

interface ArticleDetailViewProps {
  article: LegalArticle;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export default function ArticleDetailView({
  article,
  onBack,
  isBookmarked,
  onToggleBookmark
}: ArticleDetailViewProps) {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const handleCopyLink = () => {
    // Generate a beautiful clipboard text with title and citation
    const clipboardText = `"${article.title}"\nCitation: ${article.caseDetails?.citation || "Spark Law Report"}\nRead more: ${window.location.href}`;
    navigator.clipboard.writeText(clipboardText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Safe and clean parser to convert our structured mock content into JSX with styled elements
  const renderContent = (content: string) => {
    return content.split("\n\n").map((block, index) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Handle Headings (e.g. ### Title)
      if (trimmed.startsWith("###")) {
        return (
          <h3 key={index} className="text-lg font-extrabold text-neutral-950 tracking-tight mt-6 mb-3 border-b border-neutral-100 pb-1 font-sans">
            {trimmed.replace("###", "").trim()}
          </h3>
        );
      }

      // Handle Bold bullets (e.g. * **Item:** text)
      if (trimmed.startsWith("*")) {
        const listItems = trimmed.split("\n").map((item) => item.replace("*", "").trim());
        return (
          <ul key={index} className="list-disc pl-5 my-4 space-y-2 text-neutral-700 text-sm">
            {listItems.map((li, liIdx) => {
              // Parse ** text ** simple helper
              const boldMatch = li.match(/\*\*(.*?)\*\*(.*)/);
              if (boldMatch) {
                return (
                  <li key={liIdx} className="leading-relaxed">
                    <strong className="text-neutral-900">{boldMatch[1]}</strong>
                    {boldMatch[2]}
                  </li>
                );
              }
              return <li key={liIdx} className="leading-relaxed">{li}</li>;
            })}
          </ul>
        );
      }

      // Handle Blockquotes (e.g. > "quote")
      if (trimmed.startsWith(">")) {
        // Parse italics inside quote e.g. *quote*
        const text = trimmed.replace(">", "").replace(/["']/g, "").trim();
        const italicParts = text.split("*");
        return (
          <blockquote key={index} className="my-6 border-l-4 border-red-800 bg-neutral-50/80 p-4 rounded-r-lg">
            <p className="text-sm font-medium text-neutral-800 italic leading-relaxed">
              "{italicParts.map((part, pIdx) => pIdx % 2 === 1 ? <em key={pIdx} className="font-bold">{part}</em> : part)}"
            </p>
          </blockquote>
        );
      }

      // Standard Paragraph
      return (
        <p key={index} className="text-neutral-700 text-sm sm:text-base leading-relaxed mb-4 font-serif">
          {trimmed.split("**").map((part, pIdx) => {
            // Basic inline bold parser
            return pIdx % 2 === 1 ? <strong key={pIdx} className="text-neutral-950 font-sans font-extrabold">{part}</strong> : part;
          })}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm"
      id="article-detail-container"
    >
      {/* Top action header for article back controls */}
      <div className="border-b border-neutral-100 px-6 py-4 bg-neutral-50 flex items-center justify-between sticky top-[104px] z-30">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-neutral-600 hover:text-red-800 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Updates</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onToggleBookmark(article.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
              isBookmarked
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-red-800" : ""}`} />
            <span>{isBookmarked ? "Bookmarked" : "Save Case"}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm hover:shadow"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Citation!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Citation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Image inside Reader */}
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-neutral-100 border-b border-neutral-100">
        <img
          src={article.imageUrl}
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-6 text-white flex items-center space-x-2.5">
          <span className="bg-red-800 text-white text-[10px] font-extrabold px-3 py-1 rounded uppercase tracking-wider">
            {article.category}
          </span>
          {article.subcategory && (
            <span className="bg-black/40 text-neutral-200 text-[10px] font-bold px-3 py-1 rounded tracking-wide backdrop-blur-sm">
              {article.subcategory}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-10 space-y-6">
        {/* Article Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-tight">
          {article.title}
        </h1>

        {/* Metadata lines */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-neutral-500 border-y border-neutral-100 py-3.5">
          <div className="flex items-center space-x-1.5 text-neutral-700">
            <User className="w-4 h-4 text-neutral-400" />
            <span>By {article.author}</span>
          </div>
          <span className="text-neutral-300 hidden sm:inline">|</span>
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span>Published {formattedDate}</span>
          </div>
          <span className="text-neutral-300 hidden sm:inline">|</span>
          <div className="flex items-center space-x-1.5">
            <Eye className="w-4 h-4 text-neutral-400" />
            <span>{article.views.toLocaleString()} reads</span>
          </div>
        </div>

        {/* Court Docket table (very key to LiveLaw look and feel) */}
        {article.caseDetails && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-red-900 text-white px-4 py-2 text-xs font-extrabold uppercase tracking-widest flex items-center space-x-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Supreme Court / High Court Docket Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 text-xs">
              <div className="border-b border-neutral-200 sm:border-r p-3.5 space-y-1">
                <span className="text-neutral-400 uppercase tracking-wider font-extrabold text-[9px] block">Case Title</span>
                <span className="font-bold text-neutral-800 italic">{article.caseDetails.caseName}</span>
              </div>
              <div className="border-b border-neutral-200 p-3.5 space-y-1">
                <span className="text-neutral-400 uppercase tracking-wider font-extrabold text-[9px] block">Citation Index</span>
                <span className="font-mono font-bold text-red-800">{article.caseDetails.citation}</span>
              </div>
              <div className="border-b border-neutral-200 sm:border-b-0 sm:border-r p-3.5 space-y-1">
                <span className="text-neutral-400 uppercase tracking-wider font-extrabold text-[9px] block">Hon'ble Bench</span>
                <span className="font-semibold text-neutral-800">{article.caseDetails.bench}</span>
              </div>
              <div className="p-3.5 space-y-1">
                <span className="text-neutral-400 uppercase tracking-wider font-extrabold text-[9px] block">Case / Writ Number</span>
                <span className="font-mono font-semibold text-neutral-700">{article.caseDetails.caseNumber}</span>
              </div>
            </div>
          </div>
        )}

        {/* Article Summary Box */}
        <div className="p-4 bg-red-50/50 border-l-4 border-red-800 text-neutral-800 text-sm italic font-medium rounded-r-lg leading-relaxed">
          <strong className="text-red-900 block font-sans font-extrabold text-[10px] uppercase tracking-wider not-italic mb-1">
            Summary of Ruling:
          </strong>
          {article.summary}
        </div>

        {/* Main Parsed content */}
        <div className="prose prose-neutral max-w-none pt-2">
          {renderContent(article.content)}
        </div>

        {/* Tags footer */}
        <div className="pt-6 border-t border-neutral-100 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
