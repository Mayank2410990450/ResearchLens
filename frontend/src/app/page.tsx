'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Microscope,
  FileText,
  Search,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MOCK_PAPERS } from '@/lib/mockData';

export default function StageOneShowcasePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = React.useState('components');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoadingButton, setIsLoadingButton] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSimulateLoad = () => {
    setIsLoadingButton(true);
    setTimeout(() => {
      setIsLoadingButton(false);
      showToast({
        type: 'success',
        title: 'Action Succeeded',
        message: 'Verified citation successfully synchronized with vector index.',
      });
    }, 1000);
  };

  const filteredPapers = MOCK_PAPERS.filter(
    (paper) =>
      paper.metadata?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.metadata?.primaryMethodology.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="relative min-h-screen pb-20 bg-grid-pattern">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-navy-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-glow">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 dark:from-white dark:via-violet-200 dark:to-cyan-200 bg-clip-text text-transparent">
                ResearchLens
              </span>
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Phase 2 • Stage 1
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="verified">Design System Active</Badge>
            <Button
              variant="glass"
              size="sm"
              onClick={() => {
                showToast({
                  type: 'info',
                  title: 'Stage 1 Verification',
                  message: 'Design tokens, typography, and reusable primitives loaded.',
                });
              }}
            >
              Test Notification
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        {/* Banner Section */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel-glow p-8 rounded-3xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="violet">Frontend Architecture Foundation</Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tailwind CSS + Framer Motion</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Scientific Design System & UI Primitives
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl text-sm sm:text-base leading-relaxed">
                  Stage 1 establishes the production design system, color tokens (Navy/Violet/Cyan), scientific badges,
                  glassmorphic layered cards, accessible modal dialogs, and animated tab controls.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  <Layers className="w-4 h-4 mr-1.5" />
                  Open Spec Dialog
                </Button>
                <Button variant="secondary" onClick={handleSimulateLoad} isLoading={isLoadingButton}>
                  Simulate Ingest Action
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Tab Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Tabs
            tabs={[
              { id: 'components', label: 'Reusable Primitives', icon: <Layers className="w-4 h-4" /> },
              { id: 'palette', label: 'Scientific Color Palette', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'papers', label: 'Corpus Dataset Sample', icon: <BookOpen className="w-4 h-4" />, badge: MOCK_PAPERS.length },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div className="w-full sm:w-72">
            <Input
              placeholder="Filter showcase elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Tab 1: Reusable Primitives */}
        {activeTab === 'components' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
          >
            {/* Buttons Showcase */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-violet-500" />
                  Interactive Motion Buttons
                </CardTitle>
                <CardDescription>
                  Supports magnetic hover scaling, micro-interaction feedback, states, and accessibility rings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary Violet</Button>
                  <Button variant="secondary">Secondary Navy</Button>
                  <Button variant="cyan">Scientific Cyan</Button>
                  <Button variant="glass">Glass Surface</Button>
                  <Button variant="outline">Outline Border</Button>
                  <Button variant="ghost">Ghost Action</Button>
                  <Button variant="danger">Danger Alert</Button>
                  <Button variant="primary" isLoading={true}>
                    Processing
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      showToast({
                        type: 'warning',
                        title: 'Context Boundary Alert',
                        message: 'Retrieved chunk exceeds 3,500 token limit.',
                      })
                    }
                  >
                    Trigger Warning Toast
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      showToast({
                        type: 'error',
                        title: 'Injection Blocked',
                        message: 'Adversarial instruction detected inside uploaded PDF and neutralized.',
                      })
                    }
                  >
                    Trigger Security Toast
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Badges Showcase */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Scientific Status & Grounding Badges
                </CardTitle>
                <CardDescription>
                  Distinguishes between verified author findings, AI hypotheses, and ingestion pipeline states.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="verified">Verified Citation (p. 4)</Badge>
                  <Badge variant="hypothesis">AI-Hypothesized Gap</Badge>
                  <Badge variant="processing">Embedding 384-d Vectors</Badge>
                  <Badge variant="violet">NeurIPS 2017</Badge>
                  <Badge variant="cyan">Top 1 Precision</Badge>
                  <Badge variant="error">Unverified Claim</Badge>
                  <Badge variant="default">Default Neutral</Badge>
                  <Badge variant="outline">Outline Pill</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Layered Cards Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="interactive" glowColor="violet">
                <CardHeader>
                  <Badge variant="violet" size="sm" className="w-fit mb-2">
                    Methodology
                  </Badge>
                  <CardTitle className="text-base">Self-Attention Mechanism</CardTitle>
                  <CardDescription>
                    Dispenses with recurrence and convolution, relying on multi-head scaled dot-product attention.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-950/80 font-mono text-xs text-slate-700 dark:text-slate-300">
                    Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V
                  </div>
                </CardContent>
                <CardFooter className="justify-between text-xs text-slate-500">
                  <span>Vaswani et al.</span>
                  <span className="font-semibold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Grounded
                  </span>
                </CardFooter>
              </Card>

              <Card variant="interactive" glowColor="cyan">
                <CardHeader>
                  <Badge variant="cyan" size="sm" className="w-fit mb-2">
                    Efficiency
                  </Badge>
                  <CardTitle className="text-base">FlashAttention IO-Awareness</CardTitle>
                  <CardDescription>
                    Fuses softmax computation to bypass GPU High Bandwidth Memory (HBM) IO bottlenecks.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-950/80 font-mono text-xs text-slate-700 dark:text-slate-300">
                    Memory IO reduction: O(N^2) to O(N) in SRAM
                  </div>
                </CardContent>
                <CardFooter className="justify-between text-xs text-slate-500">
                  <span>Dao et al.</span>
                  <span className="font-semibold text-cyan-400">NeurIPS 2022</span>
                </CardFooter>
              </Card>

              <Card variant="interactive" glowColor="emerald">
                <CardHeader>
                  <Badge variant="verified" size="sm" className="w-fit mb-2">
                    PEFT
                  </Badge>
                  <CardTitle className="text-base">Low-Rank Adaptation (LoRA)</CardTitle>
                  <CardDescription>
                    Decomposes dense weight update matrices into rank r significantly smaller than d trainable factors.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-950/80 font-mono text-xs text-slate-700 dark:text-slate-300">
                    W = W_0 + B * A, where B in R^(d x r), A in R^(r x k)
                  </div>
                </CardContent>
                <CardFooter className="justify-between text-xs text-slate-500">
                  <span>Hu et al.</span>
                  <span className="font-semibold text-emerald-400">ICLR 2022</span>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Scientific Color Palette */}
        {activeTab === 'palette' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
          >
            {[
              { name: 'Deep Navy Canvas', hex: '#020617', desc: 'Main dark mode background surface', role: 'bg-navy-950' },
              { name: 'Navy Secondary Surface', hex: '#0F172A', desc: 'Glassmorphic card container', role: 'bg-navy-850' },
              { name: 'Electric Violet', hex: '#6366F1', desc: 'AI synthesis, primary brand actions', role: 'bg-indigo-500' },
              { name: 'Deep Violet Accent', hex: '#7C3AED', desc: 'Gradients and focus highlights', role: 'bg-violet-600' },
              { name: 'Scientific Cyan', hex: '#06B6D4', desc: 'Methodological tags & metric scores', role: 'bg-cyan-500' },
              { name: 'Verified Emerald', hex: '#10B981', desc: 'Audited author citations & proof badges', role: 'bg-emerald-500' },
              { name: 'Hypothesis Amber', hex: '#F59E0B', desc: 'AI-generated research gap indicator', role: 'bg-amber-500' },
              { name: 'Security Rose', hex: '#F43F5E', desc: 'Prompt injection & parse failure alert', role: 'bg-rose-500' },
              { name: 'Slate Border Line', hex: '#1E293B', desc: 'Card dividers & structural borders', role: 'bg-slate-800' },
            ].map((color, idx) => (
              <Card key={idx} variant="glass" className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl shadow-inner border border-white/20 flex-shrink-0 ${color.role}`} />
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{color.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400">{color.hex}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{color.desc}</p>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Tab 3: Corpus Dataset Sample */}
        {activeTab === 'papers' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {filteredPapers.map((paper) => (
              <Card key={paper.id} variant="glass" className="hover:border-violet-500/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="violet" size="sm">
                        {paper.metadata?.journalOrVenue}
                      </Badge>
                      <Badge variant="verified" size="sm">
                        {paper.pageCount} Pages Extracted
                      </Badge>
                      <span className="text-xs text-slate-500 font-mono">{paper.metadata?.publicationYear}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-violet-400" />
                      {paper.metadata?.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {paper.metadata?.abstract}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {paper.metadata?.keywords.map((kw, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                    <span className="text-[11px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Status: {paper.processingStatus}
                    </span>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() =>
                        showToast({
                          type: 'info',
                          title: paper.metadata?.title || 'Paper',
                          message: `Methodology: ${paper.metadata?.primaryMethodology}`,
                        })
                      }
                    >
                      Inspect Chunks
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </div>

      {/* Accessible Modal Spec Window */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Stage 1: Design System & Architecture Spec"
        description="Phase 2 Foundation Verification"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300">
            <span className="font-semibold block text-sm mb-1 text-violet-200">Stage 1 Completed Deliverables</span>
            All foundational design system tokens, CSS glassmorphic variables, accessible animations, and core UI primitives are fully configured.
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="font-medium">Tailwind CSS 3.4.14</span>
              <span className="font-mono text-emerald-400">Configured</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="font-medium">Framer Motion 11.11.11</span>
              <span className="font-mono text-emerald-400">Configured</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="font-medium">Lucide Icons</span>
              <span className="font-mono text-emerald-400">Integrated</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="font-medium">Three.js 0.169.0</span>
              <span className="font-mono text-cyan-400">Ready for Stage 2</span>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
              Close Specifications
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
