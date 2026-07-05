import React, { useState } from "react";
import { Scale, Search, Menu, X, Bookmark, Newspaper, FileText, Send, Calendar, Award } from "lucide-react";
import { CATEGORIES } from "../data";

interface HeaderProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  bookmarkCount: number;
  onViewBookmarks: () => void;
  onSubmitUpdateOpen: () => void;
  onGoHome: () => void;
  activeTab: "news" | "bookmarks" | "submissions";
}

export default function Header({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  bookmarkCount,
  onViewBookmarks,
  onSubmitUpdateOpen,
  onGoHome,
  activeTab
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleCategoryClick = (category: string) => {
    onSelectCategory(category);
    setIsMobileMenuOpen(false);
  };

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200 shadow-sm" id="main-header">
      {/* Top Banner: Date and Live Status */}
      <div className="bg-neutral-900 text-white py-1.5 px-4 text-xs font-medium tracking-wide flex justify-between items-center sm:px-6 md:px-8">
        <div className="flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-red-500" />
          <span>{formattedDate}</span>
          <span className="hidden sm:inline text-neutral-400">|</span>
          <span className="hidden sm:inline text-neutral-300">Supreme Court & High Courts Daily Dispatch</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onSubmitUpdateOpen}
            className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors font-medium cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Submit Law Update</span>
          </button>
          <span className="text-neutral-500">|</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 text-[11px] font-semibold tracking-wider uppercase">Live Coverage</span>
          </div>
        </div>
      </div>

      {/* Main Bar: Logo, Search, Bookmarks */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          onClick={onGoHome} 
          className="flex items-center space-x-3 cursor-pointer select-none group shrink-0"
        >
          <div className="bg-red-800 text-white p-2 rounded-lg transition-transform group-hover:scale-105 shadow-md">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="font-extrabold text-2xl tracking-tighter text-red-800 font-sans">
                SPARK LAW
              </span>
              <span className="font-semibold text-xs tracking-widest text-neutral-500 uppercase">
                PORTAL
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 font-medium tracking-tight -mt-0.5">
              India's Premier Legal News & Analysis Platform
            </p>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <div className={`relative w-full flex items-center border transition-all duration-300 rounded-full bg-neutral-50 px-3.5 py-2 ${
            isSearchFocused ? "border-red-600 bg-white ring-2 ring-red-100" : "border-neutral-200 hover:border-neutral-300"
          }`}>
            <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search Supreme Court, High Court, orders, judgements..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full text-sm text-neutral-800 focus:outline-none placeholder-neutral-400 bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 px-1.5"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            onClick={onViewBookmarks}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "bookmarks"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <Bookmark className={`w-4.5 h-4.5 ${activeTab === "bookmarks" ? "fill-red-800 text-red-800" : ""}`} />
            <span className="hidden sm:inline">Bookmarks</span>
            {bookmarkCount > 0 && (
              <span className="flex items-center justify-center bg-red-800 text-white text-xs font-bold w-5 h-5 rounded-full">
                {bookmarkCount}
              </span>
            )}
          </button>

          <button
            onClick={onSubmitUpdateOpen}
            className="hidden sm:flex items-center space-x-1.5 px-4 py-2 bg-red-800 hover:bg-red-950 text-white rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Newspaper className="w-4 h-4" />
            <span>Submit Case</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Categories Bar (Desktop) */}
      <div className="hidden md:block border-t border-neutral-100 bg-neutral-50 py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((category) => {
              const isSelected = currentCategory === category && activeTab === "news";
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-red-800 text-white shadow-sm"
                      : "text-neutral-600 hover:text-red-800 hover:bg-neutral-200/50"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu & Sub-headers */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 shadow-xl absolute top-full left-0 w-full max-h-[85vh] overflow-y-auto">
          {/* Mobile Search Bar */}
          <div className="p-4 border-b border-neutral-100">
            <div className="relative flex items-center border border-neutral-300 rounded-lg bg-neutral-50 px-3 py-2">
              <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Search case, orders, judgments..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full text-sm focus:outline-none bg-transparent placeholder-neutral-400 text-neutral-800"
              />
            </div>
          </div>

          {/* Mobile Navigation List */}
          <div className="p-4 py-2">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-3 mb-2">
              Legal News Categories
            </p>
            <div className="grid grid-cols-2 gap-1 mb-4">
              {CATEGORIES.map((category) => {
                const isSelected = currentCategory === category && activeTab === "news";
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isSelected
                        ? "bg-red-800 text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <hr className="border-neutral-100 my-4" />

            {/* Quick Mobile Shortcuts */}
            <div className="space-y-1.5 px-2 pb-4">
              <button
                onClick={() => {
                  onViewBookmarks();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between text-neutral-700 hover:bg-neutral-50 p-2.5 rounded-lg text-sm font-medium"
              >
                <span className="flex items-center space-x-2.5">
                  <Bookmark className="w-4 h-4 text-neutral-500" />
                  <span>Your Bookmarks</span>
                </span>
                {bookmarkCount > 0 && (
                  <span className="bg-red-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {bookmarkCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  onSubmitUpdateOpen();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 text-neutral-700 hover:bg-neutral-50 p-2.5 rounded-lg text-sm font-medium"
              >
                <FileText className="w-4 h-4 text-neutral-500" />
                <span>Submit Legal Update</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
