'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FinalCtaSection() {
  return (
    <section className="py-28 relative overflow-hidden bg-navy-950">
      {/* Ambient background light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel-glow p-12 sm:p-16 rounded-3xl border border-violet-500/30"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Accelerate Your Scientific Research</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Ready to Uncover Deep Scientific Insights?
          </h2>

          <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Upload your first collection of scientific papers. Ask complex methodological questions, generate grounded comparison matrices, and discover research gaps.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/workspace/dashboard" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 shadow-glow gap-2"
              >
                <span>Launch Your Research Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-wrap justify-center items-center gap-6 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Traceable Document Citations
            </span>
            <span>•</span>
            <span>Multi-Paper Synthesis</span>
            <span>•</span>
            <span>No Model Hallucinations</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
