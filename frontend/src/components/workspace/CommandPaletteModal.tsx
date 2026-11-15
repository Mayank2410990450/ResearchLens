'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FileText,
  Bot,
  Scale,
  Sparkles,
  BookMarked,
  StickyNote,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useWorkspace } from '@/lib/workspaceStore';

export function CommandPaletteModal() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    papers,
    setActiveReaderPaper,
  } = useWorkspace();

  const [query, setQuery] = React.useState('');

  const filteredPapers = papers.filter((p) =>
    p.metadata?.title.toLowerCase().includes(query.toLowerCase())
  );

  const navigationCommands = [
    { title: 'Open Intelligent Dashboard', href: '/workspace/dashboard', icon: BarChart3 },
    { title: 'Open Research Paper Library', href: '/workspace/library', icon: FileText },
    { title: 'Open AI Research Assistant (Split-Screen)', href: '/workspace/assistant', icon: Bot },
    { title: 'Open Multi-Paper Comparison Matrix', href: '/workspace/comparison', icon: Scale },
    { title: 'Open Research Gap Explorer', href: '/workspace/gaps', icon: Sparkles },
    { title: 'Open Literature Review Studio', href: '/workspace/review', icon: BookMarked },
    { title: 'Open Notes & Highlights', href: '/workspace/notes', icon: StickyNote },
    { title: 'Open Retrieval Analytics & IR Benchmarks', href: '/workspace/analytics', icon: BarChart3 },
  ].filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelectPaper = (paper: (typeof papers)[0]) => {
    setActiveReaderPaper(paper);
    setIsCommandPaletteOpen(false);
    router.push('/workspace/assistant');
  };

  const handleSelectNav = (href: string) => {
    setIsCommandPaletteOpen(false);
    router.push(href);
  };

  return (
    <Modal
      isOpen={isCommandPaletteOpen}
      onClose={() => setIsCommandPaletteOpen(false)}
      title="Global Research Command Palette"
      description="Quickly navigate workspace or jump into indexed papers"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Type paper title, methodology, or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            autoFocus
          />
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
          {/* Papers */}
          <div>
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 px-2">
              Indexed Scientific Papers ({filteredPapers.length})
            </span>
            <div className="space-y-1">
              {filteredPapers.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPaper(p)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate">
                      {p.metadata?.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 flex-shrink-0 ml-2">
                    {p.metadata?.journalOrVenue}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Commands */}
          <div>
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 px-2">
              Workspace Navigation
            </span>
            <div className="space-y-1">
              {navigationCommands.map((nav, i) => {
                const Icon = nav.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectNav(nav.href)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        {nav.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Jump</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
