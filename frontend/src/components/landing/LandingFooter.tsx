'use client';

import * as React from 'react';
import Link from 'next/link';
import { Microscope, Github, FileCode, ShieldCheck, Heart } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-navy-950 py-16 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/60">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-glow">
                <Microscope className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                ResearchLens
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              AI-powered research intelligence & scientific discovery platform built for universities, scholars, and academic labs.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>pgvector HNSW Index Online</span>
            </div>
          </div>

          {/* Col 2: Platform Capabilities */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase font-mono">
              Capabilities
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  PyMuPDF Document Parsing
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  Grounded AI Assistant
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  Dense-Sparse Hybrid Retrieval
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  Cross-Paper Comparison Matrix
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  Research Gap Explorer
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Research & Architecture */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase font-mono">
              Architecture & Specs
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/workspace/analytics" className="hover:text-white transition-colors">
                  IR Benchmark Evaluation
                </Link>
              </li>
              <li>
                <span className="text-slate-500">FastAPI REST & WebSockets</span>
              </li>
              <li>
                <span className="text-slate-500">PostgreSQL 15 + pgvector</span>
              </li>
              <li>
                <span className="text-slate-500">Cross-Encoder Neural Reranking</span>
              </li>
              <li>
                <span className="text-slate-500">Prompt Injection Shield</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Launch */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase font-mono">
              Workspace Access
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Launch into the active research environment to analyze papers immediately.
            </p>
            <Link
              href="/workspace/dashboard"
              className="inline-flex items-center justify-center w-full px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 font-medium transition-colors"
            >
              Open Research Workspace
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 ResearchLens. Released under the MIT License for Academic Research.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Audited Document Grounding
            </span>
            <span>•</span>
            <span>Zero Hallucination Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
