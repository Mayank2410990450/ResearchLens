'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Bot,
  Search,
  Scale,
  Sparkles,
  BookMarked,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowUpRight,
  Database,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function CapabilitiesSection() {
  const capabilities = [
    {
      id: 'paper-analysis',
      title: 'Intelligent Paper Analysis',
      badge: 'Document Parsing',
      badgeVariant: 'violet' as const,
      description:
        'Extracts structured hierarchies, mathematical notations, experimental datasets, authors, abstracts, and page bounds using PyMuPDF.',
      visual: (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>§ 3.2 Methodology</span>
            <span className="text-emerald-400">Parsed p. 4</span>
          </div>
          <div className="p-2 rounded-lg bg-navy-950 border border-violet-500/30 text-violet-300">
            {"Attention(Q, K, V) = softmax(QK^T / √d_k)V"}
          </div>
          <div className="flex gap-1.5">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">WMT 2014</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">8 Heads</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">d_model=512</span>
          </div>
        </div>
      ),
    },
    {
      id: 'ai-assistant',
      title: 'Grounded AI Assistant',
      badge: 'Zero Hallucination',
      badgeVariant: 'verified' as const,
      description:
        'Every factual claim links to exact document page numbers and excerpts. Verifiable citations eliminate AI hallucinations.',
      visual: (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
          <div className="p-2.5 rounded-lg bg-violet-950/60 border border-violet-500/30 text-slate-200">
            <p className="leading-relaxed">
              Standard attention incurs an <span className="text-cyan-300 font-mono">O(n² · d)</span> complexity bottleneck per layer...
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                <CheckCircle2 className="w-3 h-3" /> Vaswani et al., p. 4
              </span>
              <span className="text-[10px] font-mono text-slate-400">96% Conf</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'hybrid-retrieval',
      title: 'Semantic Hybrid Retrieval',
      badge: 'pgvector + BM25',
      badgeVariant: 'cyan' as const,
      description:
        'Combines dense sentence embeddings with lexical inverted search and neural cross-encoder reranking for ultra-precise recall.',
      visual: (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Dense Cosine (HNSW)</span>
            <span className="text-cyan-400">Top 25</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Sparse BM25 (tsvector)</span>
            <span className="text-indigo-400">Top 25</span>
          </div>
          <div className="p-1.5 rounded bg-gradient-to-r from-violet-900/50 to-cyan-900/50 border border-cyan-500/40 text-center text-cyan-200 font-semibold">
            RRF Rank Fusion → Cross-Encoder
          </div>
        </div>
      ),
    },
    {
      id: 'paper-comparison',
      title: 'Multi-Paper Matrix Comparison',
      badge: 'Comparative Analysis',
      badgeVariant: 'violet' as const,
      description:
        'Select 2 to 5 papers to extract side-by-side matrices across objectives, methodologies, datasets, algorithms, and empirical results.',
      visual: (
        <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] font-mono">
          <div className="grid grid-cols-3 gap-1 pb-1 border-b border-slate-800 text-slate-400 font-semibold">
            <span>Metric</span>
            <span>Transformer</span>
            <span>FlashAttn</span>
          </div>
          <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-800/60 text-slate-300">
            <span className="text-slate-400">Complexity</span>
            <span className="text-amber-400">O(N²) IO</span>
            <span className="text-emerald-400">O(N) IO</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1 text-slate-300">
            <span className="text-slate-400">Memory</span>
            <span>HBM Bound</span>
            <span className="text-cyan-300">SRAM Tiled</span>
          </div>
        </div>
      ),
    },
    {
      id: 'gap-discovery',
      title: 'Research Gap Explorer',
      badge: 'Discovery Engine',
      badgeVariant: 'hypothesis' as const,
      description:
        'Identifies repeated research bottlenecks, experimental limitations reported by authors, and synthesized open research opportunities.',
      visual: (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Identified Research Opportunity</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Quantization robustness in low-rank adapters diverges under INT4 scaling without layer-wise curvature compensation.
          </p>
        </div>
      ),
    },
    {
      id: 'literature-review',
      title: 'Literature Review Synthesis',
      badge: 'Academic Publishing',
      badgeVariant: 'default' as const,
      description:
        'Generates comprehensive thematic literature reviews with introduction, methodology comparisons, and APA reference lists.',
      visual: (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 font-mono">
          <div className="flex items-center gap-2 text-violet-300 text-[11px]">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Structured Review Outline</span>
          </div>
          <ul className="text-[10px] text-slate-400 space-y-1 list-disc list-inside">
            <li>1. Thematic Attention Paradigms</li>
            <li>2. IO-Memory Architecture Bottlenecks</li>
            <li>3. Parameter-Efficient Adaptations</li>
            <li>4. APA Formatted References (12 Papers)</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <section id="capabilities" className="py-28 relative bg-navy-950/80">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="violet" className="mb-3">
            Core Scientific Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Engineered for Deep Academic Discovery
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            ResearchLens goes far beyond simple summarization, providing a structured, verifiable workspace built for researchers, universities, and labs.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <Card
                variant="interactive"
                glowColor={
                  item.badgeVariant === 'verified'
                    ? 'emerald'
                    : item.badgeVariant === 'cyan'
                    ? 'cyan'
                    : 'violet'
                }
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={item.badgeVariant} size="sm">
                        {item.badge}
                      </Badge>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed mt-1">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardContent className="pt-2">{item.visual}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
