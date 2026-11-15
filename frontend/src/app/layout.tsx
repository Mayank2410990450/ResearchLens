import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'ResearchLens | AI Research Intelligence & Scientific Discovery Platform',
  description:
    'An advanced AI-powered research workspace for scientific paper analysis, grounded literature synthesis, methodology comparison, and research gap discovery.',
  keywords: [
    'Research Intelligence',
    'Scientific Papers',
    'RAG',
    'Literature Review',
    'Methodology Comparison',
    'Research Gaps',
    'Academic AI',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-violet-500/20 selection:text-violet-300">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
