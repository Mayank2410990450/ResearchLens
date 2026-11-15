'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronDown,
  Database,
  FileSearch,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ResearchHero3D } from '@/components/3d/ResearchHero3D';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden">
      {/* 3D WebGL Interactive Simulation */}
      <ResearchHero3D />

      <div className="max-w-6xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        {/* Top Announcement Pill */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-medium backdrop-blur-md mb-8 shadow-glow"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Next-Generation AI Scientific Discovery Platform</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </motion.div>

        {/* Cinematic Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] sm:leading-[1.1]"
        >
          Discover Beyond{' '}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            Research.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="mt-6 text-base sm:text-lg md:text-xl text-slate-300/90 max-w-3xl leading-relaxed font-normal"
        >
          Understand scientific papers, extract methodologies, cross-compare empirical studies side by side, and uncover unexplored research gaps with{' '}
          <span className="text-white font-medium">audited, traceable document citations</span>. Never hallucinate findings.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link href="/workspace/dashboard" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 text-base shadow-glow gap-2"
            >
              <span>Start Researching</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <a href="#capabilities" className="w-full sm:w-auto">
            <Button
              variant="glass"
              size="lg"
              className="w-full sm:w-auto px-7 text-base gap-2"
            >
              <FileSearch className="w-4 h-4 text-cyan-400" />
              <span>Explore Capabilities</span>
            </Button>
          </a>
        </motion.div>

        {/* Scientific Credentials Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
          className="mt-16 pt-8 border-t border-slate-800/60 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs font-mono text-slate-400"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Hallucination Grounding</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-400" />
            <span>pgvector HNSW Cosine Index</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Hybrid Dense-Sparse Reranking</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Multi-Paper Synthesis</span>
          </div>
        </motion.div>
      </div>

      {/* Subtle Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-slate-500 text-xs pointer-events-none"
      >
        <span className="mb-1 text-[11px] font-mono tracking-wider">SCROLL</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}
