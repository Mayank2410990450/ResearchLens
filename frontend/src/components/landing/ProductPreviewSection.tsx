'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Bot,
  Columns,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Search,
  BookOpen,
  Layers,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function ProductPreviewSection() {
  const [activeTab, setActiveTab] = React.useState('split-reader');
  const [highlightActive, setHighlightActive] = React.useState(true);

  return (
    <section id="preview" className="py-28 relative bg-navy-900/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="violet" className="mb-3">
            Interactive Product Preview
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Experience the Research Workspace
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            A cognitive scientific environment uniting deep PDF reading, grounded AI dialogue, multi-paper comparison matrices, and gap discovery.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <Tabs
            tabs={[
              {
                id: 'split-reader',
                label: 'Split-Screen RAG Reader',
                icon: <Columns className="w-4 h-4" />,
              },
              {
                id: 'comparison',
                label: 'Multi-Paper Matrix',
                icon: <Layers className="w-4 h-4" />,
              },
              {
                id: 'gaps',
                label: 'Research Gap Explorer',
                icon: <Sparkles className="w-4 h-4" />,
              },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Interactive Workspace Mockup Shell */}
        <div className="glass-panel rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          {/* Window Chrome Header */}
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 text-xs font-mono text-slate-400">
                researchlens-workspace // project: transformer-foundations
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Badge variant="verified" size="sm">
                Hybrid RAG Engine: Online
              </Badge>
            </div>
          </div>

          {/* Interactive Screen Content */}
          <div className="p-6 bg-navy-950/70 min-h-[500px]">
            <AnimatePresence mode="wait">
              {/* TAB 1: Split-Screen RAG Reader */}
              {activeTab === 'split-reader' && (
                <motion.div
                  key="split-reader"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  {/* Left: Document Viewer (PDF Preview) */}
                  <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between">
                    <div>
                      {/* Document Toolbar */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 mb-4">
                        <span className="font-semibold text-slate-200 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-violet-400" />
                          attention_is_all_you_need.pdf (Page 4 of 15)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono">
                            Zoom 100%
                          </span>
                        </div>
                      </div>

                      {/* Mock Academic Page Render */}
                      <div className="space-y-4 font-serif text-slate-300 text-xs leading-relaxed p-4 bg-slate-950/90 rounded-xl border border-slate-800/80">
                        <h4 className="font-sans font-bold text-sm text-white">
                          3.2 Attention Mechanism & Scaled Dot-Product
                        </h4>
                        <p>
                          An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors.
                        </p>

                        {/* Interactive Highlighted Region */}
                        <div
                          className={`p-3 rounded-lg transition-all duration-300 ${
                            highlightActive
                              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                              : 'bg-slate-900 border border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">
                            [TARGET CITATION EXCERPT - PAGE 4, §3.2]
                          </span>
                          <p className="font-mono text-xs">
                            {"Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V"}
                          </p>
                          <p className="mt-1 text-[11px]">
                            We compute the matrix of outputs as: the dot products of the query with all keys, divide each by sqrt(d_k), and apply a softmax function.
                          </p>
                        </div>

                        <p className="text-slate-400">
                          The two most commonly used attention functions are additive attention and dot-product attention...
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Jump: Page 4 of 15</span>
                      <button
                        onClick={() => setHighlightActive(!highlightActive)}
                        className="text-violet-400 hover:text-violet-300 underline"
                      >
                        Toggle Citation Highlight
                      </button>
                    </div>
                  </div>

                  {/* Right: AI Assistant Conversation Thread */}
                  <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-cyan-400" />
                          Grounded Research Assistant
                        </span>
                        <Badge variant="verified" size="sm">
                          Source Verified
                        </Badge>
                      </div>

                      {/* User Message */}
                      <div className="p-3 rounded-xl bg-slate-800/80 text-xs text-slate-200">
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          Researcher Query:
                        </span>
                        What is the mathematical formulation of scaled dot-product attention, and why is the scaling factor included?
                      </div>

                      {/* Assistant Grounded Message */}
                      <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-slate-200 space-y-2">
                        <span className="text-[10px] font-mono text-violet-400 block font-semibold">
                          Assistant Response:
                        </span>
                        <p className="leading-relaxed">
                          Scaled dot-product attention is formally defined as:
                        </p>
                        <div className="p-2 rounded bg-navy-950 font-mono text-[11px] text-cyan-300">
                          Attention(Q, K, V) = softmax(QK^T / √d_k)V
                        </div>
                        <p className="leading-relaxed text-slate-300 text-[11px]">
                          The 1/√d_k scaling factor counteracts large dot-product magnitudes that would push the softmax into vanishing gradient regions.
                        </p>

                        {/* Clickable Citation Pill */}
                        <div
                          onClick={() => setHighlightActive(true)}
                          className="cursor-pointer mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Attention Is All You Need • Page 4</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            96% Match
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                      <span className="text-[11px] font-mono text-slate-500">
                        Click citation pill to synchronize with PDF page bounds
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: Multi-Paper Comparison Matrix */}
              {activeTab === 'comparison' && (
                <motion.div
                  key="comparison"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 overflow-x-auto"
                >
                  <div className="min-w-[700px]">
                    <div className="grid grid-cols-4 gap-3 pb-3 border-b border-slate-800 text-xs font-mono font-bold text-slate-400">
                      <span>Dimension</span>
                      <span className="text-violet-400">Vaswani et al. (2017)</span>
                      <span className="text-cyan-400">He et al. (2016)</span>
                      <span className="text-emerald-400">Dao et al. (2022)</span>
                    </div>

                    <div className="divide-y divide-slate-800/60 text-xs text-slate-300">
                      <div className="grid grid-cols-4 gap-3 py-3 font-mono">
                        <span className="text-slate-400 font-semibold">Objective</span>
                        <span>Dispense with recurrence in transduction</span>
                        <span>Enable training of deep 152-layer CNNs</span>
                        <span>Eliminate IO memory bottleneck in attention</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 py-3 font-mono">
                        <span className="text-slate-400 font-semibold">Methodology</span>
                        <span>Multi-Head Scaled Dot-Product</span>
                        <span>Identity Shortcut Mapping F(x) + x</span>
                        <span>GPU SRAM Tiling & Online Softmax</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 py-3 font-mono">
                        <span className="text-slate-400 font-semibold">Complexity</span>
                        <span className="text-amber-400">O(N² · d)</span>
                        <span>O(C · K² · H · W)</span>
                        <span className="text-emerald-400">O(N) IO in SRAM</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 py-3 font-mono">
                        <span className="text-slate-400 font-semibold">Dataset</span>
                        <span>WMT 2014 En-De (28.4 BLEU)</span>
                        <span>ImageNet (3.57% Top-5 Error)</span>
                        <span>Long Range Arena & OpenWebText</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 py-3 font-mono">
                        <span className="text-slate-400 font-semibold">Stated Limitation</span>
                        <span className="text-amber-300">Quadratic with sequence length</span>
                        <span className="text-amber-300">Channel dimensional bottleneck</span>
                        <span className="text-amber-300">Cross-attention asymmetric length</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: Research Gap Explorer */}
              {activeTab === 'gaps' && (
                <motion.div
                  key="gaps"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="verified">Author-Reported Limitation</Badge>
                      <span className="text-xs font-mono text-emerald-400">Ground Truth</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Memory Bandwidth Throttle in Cross-Attention
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Dao et al. explicitly report that while FlashAttention handles symmetric self-attention in linear IO, asymmetric cross-attention sequences incur cache fragmentation on multi-head architectures.
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-400 border border-slate-800">
                      Source: FlashAttention (NeurIPS 2022, Page 9, Section 5)
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="hypothesis">AI-Hypothesized Research Gap</Badge>
                      <span className="text-xs font-mono text-amber-400">Speculative Gap</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Dynamic Rank Allocation Under Layer Gradient Curvature
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      While LoRA fixes adapter rank r uniformly across all Transformer layers, empirical gradient spectra suggest early layers require significantly lower intrinsic dimensionality than late feed-forward projections.
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-amber-300/80 border border-slate-800">
                      Cross-paper synthesis across LoRA (Hu et al.) and Vaswani et al.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
