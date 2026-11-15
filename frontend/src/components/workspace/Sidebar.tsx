'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  Scale,
  Sparkles,
  BookMarked,
  StickyNote,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Database,
  Microscope,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/lib/workspaceStore';
import { Button } from '@/components/ui/Button';

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const { papers, setIsUploadModalOpen } = useWorkspace();

  const navItems = [
    { name: 'Dashboard', href: '/workspace/dashboard', icon: LayoutDashboard },
    { name: 'Research Library', href: '/workspace/library', icon: BookOpen, badge: papers.length },
    { name: 'AI Assistant', href: '/workspace/assistant', icon: Bot },
    { name: 'Paper Comparison', href: '/workspace/comparison', icon: Scale },
    { name: 'Literature Review', href: '/workspace/review', icon: BookMarked },
    { name: 'Gap Explorer', href: '/workspace/gaps', icon: Sparkles },
    { name: 'Knowledge Graph', href: '/workspace/visualizations', icon: Share2 },
    { name: 'Notes & Highlights', href: '/workspace/notes', icon: StickyNote },
    { name: 'Analytics & IR', href: '/workspace/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/workspace/settings', icon: Settings },
  ];

  const totalPages = papers.reduce((acc, p) => acc + p.pageCount, 0);

  return (
    <aside
      className={cn(
        'relative h-screen flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-navy-950 transition-all duration-300 z-30 select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-glow flex-shrink-0">
              <Microscope className="w-5 h-5" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  ResearchLens
                </span>
                <span className="text-[10px] block font-mono text-violet-400">
                  Research Intelligence
                </span>
              </motion.div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Upload Action */}
        <div className="p-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className={cn('w-full shadow-glow', collapsed ? 'p-2' : 'justify-start gap-2')}
          >
            <UploadCloud className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-xs font-semibold">Upload Papers</span>}
          </Button>
        </div>

        {/* Navigation List */}
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group relative',
                  isActive
                    ? 'bg-violet-600/15 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/40'
                )}
                title={collapsed ? item.name : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-violet-600 dark:bg-violet-400"
                  />
                )}
                <Icon
                  className={cn(
                    'w-4 h-4 flex-shrink-0 transition-colors',
                    isActive
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}
                />
                {!collapsed && (
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.name}
                  </span>
                )}
                {!collapsed && item.badge !== undefined && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Storage & Index Status */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
        {!collapsed ? (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Database className="w-3.5 h-3.5" /> pgvector
              </span>
              <span className="text-slate-300 font-semibold">{papers.length} Indexed</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min((papers.length / 20) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>{totalPages} Pages Extracted</span>
              <span>HNSW Cosine</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-2 text-emerald-400" title="pgvector index online">
            <Database className="w-5 h-5" />
          </div>
        )}
      </div>
    </aside>
  );
}
