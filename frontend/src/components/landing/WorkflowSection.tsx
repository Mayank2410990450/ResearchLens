'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileCode,
  Cpu,
  Compass,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function WorkflowSection() {
  const steps = [
    {
      num: '01',
      title: 'Upload Papers',
      icon: <UploadCloud className="w-6 h-6 text-violet-400" />,
      desc: 'Drag & drop multi-column academic PDFs. System performs SHA-256 deduplication and layout verification.',
      details: ['PyMuPDF parser', 'Preserves page bounds', 'Extracts tables & math'],
    },
    {
      num: '02',
      title: 'Extract Knowledge',
      icon: <FileCode className="w-6 h-6 text-cyan-400" />,
      desc: 'Splits content into hierarchical semantic chunks with section headers, generating 384-d pgvector embeddings.',
      details: ['Recursive chunking', 'all-MiniLM-L6-v2', 'PostgreSQL GIN tsvector'],
    },
    {
      num: '03',
      title: 'Hybrid AI Analysis',
      icon: <Cpu className="w-6 h-6 text-indigo-400" />,
      desc: 'Retrieves relevant excerpts using Reciprocal Rank Fusion (RRF) and neural cross-encoder reranking.',
      details: ['Dense cosine similarity', 'Sparse keyword BM25', 'Cross-Encoder reranking'],
    },
    {
      num: '04',
      title: 'Discover Insights',
      icon: <Compass className="w-6 h-6 text-emerald-400" />,
      desc: 'Query across single or multi-paper collections, synthesize literature reviews, and uncover open research gaps.',
      details: ['Traceable citations', 'Side-by-side matrices', 'Verifiable ground truth'],
    },
  ];

  return (
    <section id="workflow" className="py-28 relative overflow-hidden bg-navy-900/40">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="cyan" className="mb-3">
            Algorithmic Pipeline
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            How ResearchLens Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            From raw academic PDF ingestion to multi-document grounded synthesis, every stage is optimized for scientific rigor.
          </p>
        </div>

        {/* Workflow Steps Grid with Connecting Line */}
        <div className="relative">
          {/* Subtle Connecting Background Bar */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-violet-600/40 via-cyan-500/40 to-emerald-500/40 -translate-y-12 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
              >
                <Card variant="glass" className="h-full flex flex-col justify-between p-6">
                  <div>
                    {/* Step Number & Icon Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center shadow-inner">
                        {step.icon}
                      </div>
                      <span className="font-mono text-2xl font-black text-slate-700 dark:text-slate-600">
                        {step.num}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      {step.desc}
                    </p>
                  </div>

                  <ul className="space-y-2 border-t border-slate-800/80 pt-4">
                    {step.details.map((detail, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-[11px] font-mono text-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
