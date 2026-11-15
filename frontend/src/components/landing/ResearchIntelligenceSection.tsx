'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
  GitBranch,
  BookOpen,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ClusterNode {
  id: string;
  name: string;
  category: string;
  leadPaper: string;
  year: number;
  venue: string;
  citations: number;
  connections: string[];
  methodology: string;
  breakthrough: string;
}

const CLUSTERS: ClusterNode[] = [
  {
    id: 'transformers',
    name: 'Self-Attention Transduction',
    category: 'Core Architecture',
    leadPaper: 'Attention Is All You Need (Vaswani et al.)',
    year: 2017,
    venue: 'NeurIPS',
    citations: 124500,
    connections: ['bert', 'flashattn', 'lora'],
    methodology: 'Scaled Dot-Product Multi-Head Attention without recurrence',
    breakthrough: 'Replaces sequential RNN recurrence with parallelizable self-attention.',
  },
  {
    id: 'bert',
    name: 'Bidirectional Masked Pre-training',
    category: 'Language Modeling',
    leadPaper: 'BERT: Pre-training Deep Bidirectional Transformers (Devlin et al.)',
    year: 2019,
    venue: 'NAACL',
    citations: 86400,
    connections: ['transformers', 'lora'],
    methodology: 'Joint conditioning on both left and right context via Masked LM',
    breakthrough: 'Established universal transfer learning paradigm in natural language.',
  },
  {
    id: 'flashattn',
    name: 'IO-Aware Memory Tiling',
    category: 'Hardware Efficiency',
    leadPaper: 'FlashAttention: Fast and Memory-Efficient Exact Attention (Dao et al.)',
    year: 2022,
    venue: 'NeurIPS',
    citations: 4120,
    connections: ['transformers'],
    methodology: 'Online softmax recomputation & GPU SRAM block tiling',
    breakthrough: 'Reduces memory IO between HBM and SRAM from O(N²) to O(N).',
  },
  {
    id: 'lora',
    name: 'Low-Rank Adapter Decomposition',
    category: 'Parameter-Efficient Fine-Tuning',
    leadPaper: 'LoRA: Low-Rank Adaptation of Large Language Models (Hu et al.)',
    year: 2022,
    venue: 'ICLR',
    citations: 12900,
    connections: ['transformers', 'bert'],
    methodology: 'Decomposition of weight updates into intrinsic low-rank matrices ΔW = B·A',
    breakthrough: 'Enables 10,000x parameter reduction during domain adaptation.',
  },
  {
    id: 'resnet',
    name: 'Residual Shortcut Formulations',
    category: 'Vision Backbones',
    leadPaper: 'Deep Residual Learning for Image Recognition (He et al.)',
    year: 2016,
    venue: 'CVPR',
    citations: 198000,
    connections: ['transformers'],
    methodology: 'Identity shortcut connections learning residual mapping F(x) + x',
    breakthrough: 'Solved vanishing gradient problem in ultra-deep neural networks (152 layers).',
  },
];

export function ResearchIntelligenceSection() {
  const [selectedClusterId, setSelectedClusterId] = React.useState('transformers');

  const selectedNode =
    CLUSTERS.find((c) => c.id === selectedClusterId) || CLUSTERS[0];

  return (
    <section id="intelligence" className="py-28 relative bg-navy-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="verified" className="mb-3">
            Knowledge Graph & Lineages
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Interactive Research Intelligence
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            Explore thematic research lineages, methodology connections, and how foundational breakthroughs connect across the literature.
          </p>
        </div>

        {/* Interactive Graph & Inspection Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Cluster Graph View */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl relative overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-violet-400" />
                Select Knowledge Cluster Node
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                5 Active Lineages
              </span>
            </div>

            {/* Nodes Grid */}
            <div className="space-y-3">
              {CLUSTERS.map((node) => {
                const isSelected = node.id === selectedClusterId;
                return (
                  <motion.div
                    key={node.id}
                    onClick={() => setSelectedClusterId(node.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                      isSelected
                        ? 'bg-violet-950/40 border-violet-500 shadow-glow'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isSelected
                              ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                              : 'bg-slate-600'
                          }`}
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            {node.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {node.leadPaper}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {node.venue} {node.year}
                        </span>
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected
                              ? 'text-cyan-400 translate-x-1'
                              : 'text-slate-600'
                          }`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Node Inspector */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="glass" className="p-6 border-violet-500/30 shadow-glow">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="violet" size="sm">
                      {selectedNode.category}
                    </Badge>
                    <span className="text-xs font-mono text-cyan-400">
                      {selectedNode.citations.toLocaleString()} Citations
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {selectedNode.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mb-6">
                    {selectedNode.leadPaper}
                  </p>

                  <div className="space-y-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block mb-1 font-mono text-[11px]">
                        Primary Methodology
                      </span>
                      <p className="text-slate-200 leading-relaxed font-mono">
                        {selectedNode.methodology}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block mb-1 font-mono text-[11px]">
                        Key Scientific Breakthrough
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {selectedNode.breakthrough}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-2 font-mono text-[11px]">
                        Direct Lineage Connections in Corpus
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.connections.map((connId) => {
                          const connected = CLUSTERS.find((c) => c.id === connId);
                          return (
                            <button
                              key={connId}
                              onClick={() => setSelectedClusterId(connId)}
                              className="px-2.5 py-1 rounded-lg bg-violet-900/30 border border-violet-500/40 text-[11px] font-mono text-violet-300 hover:bg-violet-800/40 transition-colors flex items-center gap-1.5"
                            >
                              <GitBranch className="w-3 h-3 text-cyan-400" />
                              <span>{connected?.name || connId}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
