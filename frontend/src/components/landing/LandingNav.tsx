'use client';

import * as React from 'react';
import Link from 'next/link';
import { Microscope, ArrowRight, Github, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LandingNav() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-glass py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <Microscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-violet-200 bg-clip-text text-transparent">
                ResearchLens
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                AI Research OS
              </span>
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center space-x-1 p-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-800/80 px-4">
          <a
            href="#capabilities"
            className="text-xs font-medium px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Capabilities
          </a>
          <a
            href="#workflow"
            className="text-xs font-medium px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Workflow
          </a>
          <a
            href="#intelligence"
            className="text-xs font-medium px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Knowledge Graph
          </a>
          <a
            href="#preview"
            className="text-xs font-medium px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Product Preview
          </a>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/workspace/dashboard"
            className="hidden sm:inline-flex"
          >
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/workspace/dashboard">
            <Button variant="primary" size="sm" className="gap-1.5 shadow-glow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
