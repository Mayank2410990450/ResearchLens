'use client';

import * as React from 'react';
import { WorkspaceProvider } from '@/lib/workspaceStore';
import { Sidebar } from '@/components/workspace/Sidebar';
import { TopNav } from '@/components/workspace/TopNav';
import { UploadModal } from '@/components/workspace/UploadModal';
import { CommandPaletteModal } from '@/components/workspace/CommandPaletteModal';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  return (
    <WorkspaceProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100">
        {/* Collapsible Sidebar (desktop) + Mobile drawer */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Sticky Navigation */}
          <TopNav onMobileMenuToggle={() => setMobileSidebarOpen((v) => !v)} />

          {/* Dynamic Scrollable Page Content */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-grid-pattern"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>

        {/* Global Modals */}
        <UploadModal />
        <CommandPaletteModal />
      </div>
    </WorkspaceProvider>
  );
}
