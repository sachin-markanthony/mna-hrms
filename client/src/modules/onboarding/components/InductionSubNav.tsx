import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { InductionChapter } from '../types/induction.types';

export type InductionTabType =
  | 'overview'
  | 'documents'
  | 'curriculum'
  | 'roadmap'
  | 'compliance'
  | 'principles';

interface InductionSubNavProps {
  currentTab: InductionTabType;
  onTabChange: (tab: InductionTabType) => void;
  chapters: InductionChapter[];
  onSelectChapter: (chapter: InductionChapter) => void;
}

export const InductionSubNav: React.FC<InductionSubNavProps> = ({
  currentTab,
  onTabChange,
  chapters,
  onSelectChapter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredChapters = searchQuery.trim()
    ? chapters.filter(
      (c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.chapterNumber.toString().includes(searchQuery) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs: { id: InductionTabType; label: string; badge?: string }[] = [
    { id: 'overview', label: 'Induction Overview', badge: 'Active' },
    { id: 'documents', label: 'Training Document', badge: 'Handbook' },
    { id: 'curriculum', label: 'Sessions & Chapters', badge: '7 Sessions' },
    { id: 'roadmap', label: 'Interactive Roadmap' },
    { id: 'compliance', label: 'Before You Begin' },
    { id: 'principles', label: 'Working Principles' },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Module Sub-tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${isActive
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500'
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Handbook Search Query input */}
        <div ref={searchRef} className="relative w-full lg:w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 22 handbook chapters..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-y-auto p-2 z-50">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Handbook Chapters ({filteredChapters.length})
              </div>
              {filteredChapters.length > 0 ? (
                filteredChapters.map((chap) => (
                  <button
                    key={chap.id}
                    onClick={() => {
                      onSelectChapter(chap);
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-[#1e3a8a]">
                        Chapter {chap.chapterNumber}: {chap.title}
                      </span>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{chap.description}</p>
                    </div>
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded ml-2 shrink-0">
                      {chap.estimatedDuration}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">
                  No handbook chapters found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
