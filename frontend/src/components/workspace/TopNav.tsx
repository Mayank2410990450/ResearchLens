'use client';

import * as React from 'react';
import {
  Search,
  Bell,
  UploadCloud,
  ChevronDown,
  Command,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import { useWorkspace } from '@/lib/workspaceStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function TopNav({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const {
    activeProjectTitle,
    setActiveProjectTitle,
    setIsUploadModalOpen,
    setIsCommandPaletteOpen,
    papers,
  } = useWorkspace();

  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = React.useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);

  const projects = [
    'Efficiency in Transformer & Multimodal Architectures',
    'Low-Rank Adaptation & Quantization Benchmarks',
    'Vision-Language Model Optimization',
  ];

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-navy-950/70 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20" role="banner">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-2 flex-shrink-0"
        aria-label="Open navigation menu"
        aria-expanded={false}
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Left: Project Selector */}
      <div className="relative">
        <button
          onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
          <div className="max-w-[280px] sm:max-w-md truncate">
            <span className="text-[10px] font-mono text-slate-400 block leading-tight uppercase">
              Current Project Workspace
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate block">
              {activeProjectTitle}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0" />
        </button>

        {/* Project Selector Dropdown */}
        {isProjectDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 p-2 rounded-2xl glass-panel-glow bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50">
            <div className="px-3 py-2 text-[10px] font-mono text-slate-400 border-b border-slate-100 dark:border-slate-800">
              SWITCH RESEARCH WORKSPACE
            </div>
            <div className="space-y-1 mt-1">
              {projects.map((proj) => (
                <button
                  key={proj}
                  onClick={() => {
                    setActiveProjectTitle(proj);
                    setIsProjectDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    proj === activeProjectTitle
                      ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{proj}</span>
                  {proj === activeProjectTitle && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center & Right Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Trigger (Ctrl+K) */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all w-64 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search papers, notes...</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 shadow-glow" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 p-3 rounded-2xl glass-panel-glow bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                <span>Recent System Ingestions</span>
                <span className="text-[10px] font-mono text-emerald-400">3 Verified</span>
              </div>
              <div className="space-y-2 mt-2">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/60 dark:border-slate-800/80">
                  <span className="font-semibold text-slate-200 block text-[11px]">
                    FlashAttention: Fast & Memory-Efficient
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    15 pages extracted • 384-d embeddings stored
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/60 dark:border-slate-800/80">
                  <span className="font-semibold text-slate-200 block text-[11px]">
                    Hybrid Index Recomputed
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    HNSW ef_construction=64 • GIN tsvector
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Upload Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
          className="hidden sm:inline-flex gap-1.5 shadow-glow"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload PDF</span>
        </Button>

        {/* User Profile Badge & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80 dark:border-slate-800/80 hover:opacity-80 transition-opacity text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
              PS
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white block leading-tight">
                Dr. Priya Sharma
              </span>
              <span className="text-[10px] font-mono text-slate-400 block leading-none">
                Stanford AI Lab
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 p-2 rounded-2xl glass-panel-glow bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white block">Dr. Priya Sharma</span>
                <span className="text-[11px] text-slate-400 font-mono">dr.sharma@stanford.edu</span>
              </div>
              <div className="space-y-1 mt-1">
                <a
                  href="/workspace/settings"
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors block"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  Workspace Settings
                </a>
                <a
                  href="/auth"
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors block"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  Switch Account / Sign In
                </a>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('researchlens_token');
                      window.location.href = '/auth';
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-500/10 transition-colors block font-medium"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
