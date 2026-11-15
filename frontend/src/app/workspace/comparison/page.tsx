'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Scale,
  FileText,
  Download,
  Share2,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  BookOpen,
  Bot,
} from 'lucide-react';
import { useWorkspace } from '@/lib/workspaceStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function ComparisonPage() {
  const { papers, selectedPaperIds, toggleSelectPaper } = useWorkspace();
  const { showToast } = useToast();

  const comparedPapers = papers.filter((p) => selectedPaperIds.includes(p.id));

  const comparisonRows = [
    {
      aspect: 'Research Objective',
      description: 'Primary scientific hypothesis & architectural goal',
      getValue: (p: (typeof papers)[0]) => {
        if (p.id === 'paper-vaswani-2017')
          return 'Dispense with recurrent and convolutional operations in sequence transduction; establish parallel self-attention.';
        if (p.id === 'paper-dao-2022')
          return 'Eliminate quadratic GPU IO memory access between HBM and SRAM during self-attention computation.';
        if (p.id === 'paper-hu-2022')
          return 'Mitigate prohibitive full fine-tuning compute costs on large models by injecting low-rank trainable decomposition matrices.';
        if (p.id === 'paper-devlin-2019')
          return 'Pre-train deep bidirectional representations by jointly conditioning on both left and right context in all Transformer layers.';
        return 'Train substantially deeper neural networks without gradient degradation by learning residual mappings.';
      },
    },
    {
      aspect: 'Methodology & Architecture',
      description: 'Core algorithmic mechanism proposed',
      getValue: (p: (typeof papers)[0]) =>
        p.metadata?.primaryMethodology || 'Empirical benchmark with theoretical formulations',
    },
    {
      aspect: 'Datasets & Benchmarks',
      description: 'Primary evaluation corpus utilized',
      getValue: (p: (typeof papers)[0]) =>
        p.metadata?.primaryDataset || 'Custom Academic Benchmark Suite',
    },
    {
      aspect: 'Theoretical Complexity',
      description: 'Computational & memory complexity characteristics',
      getValue: (p: (typeof papers)[0]) => {
        if (p.id === 'paper-vaswani-2017')
          return 'Layer complexity: O(n² · d); Sequential operations: O(1); Maximum path length: O(1).';
        if (p.id === 'paper-dao-2022')
          return 'Time: O(N² · d); Memory IO: O(N · d² / M) where M is SRAM cache size (linear in N).';
        if (p.id === 'paper-hu-2022')
          return 'Storage: O(r · (d_in + d_out)) where rank r << d; Zero additional inference latency (weights merged).';
        return 'Standard forward/backward gradient complexity bounded by residual shortcut additions.';
      },
    },
    {
      aspect: 'Key Empirical Results',
      description: 'Primary quantitative benchmark breakthroughs',
      getValue: (p: (typeof papers)[0]) => {
        if (p.id === 'paper-vaswani-2017')
          return '28.4 BLEU on WMT 2014 English-to-German (improving over existing best by +2.0 BLEU); trained in 3.5 days on 8 GPUs.';
        if (p.id === 'paper-dao-2022')
          return '2-4x wall-clock speedup on BERT-large; scales to 64K context length without out-of-memory errors.';
        if (p.id === 'paper-hu-2022')
          return 'Matches or exceeds full fine-tuning on GLUE with 10,000x fewer trainable parameters and 3x GPU memory savings.';
        return '3.57% top-5 error on ImageNet test set; won 1st place in all ILSVRC and COCO 2015 competitions.';
      },
    },
    {
      aspect: 'Stated Limitations',
      description: 'Weaknesses & boundaries reported by original authors',
      getValue: (p: (typeof papers)[0]) => {
        if (p.id === 'paper-vaswani-2017')
          return 'Quadratic memory complexity with sequence length n poses scaling bounds on ultra-long sequences.';
        if (p.id === 'paper-dao-2022')
          return 'Cross-attention across asymmetric sequence lengths incurs non-trivial cache fragmentation in multi-head setups.';
        if (p.id === 'paper-hu-2022')
          return 'Evaluated exclusively on FP16/FP32 precision baselines; rank r is fixed uniformly across all layers.';
        return 'Channel dimensional bottlenecks in early convolution stages limit receptive field expansion.';
      },
    },
  ];

  const handleExportMarkdown = () => {
    let md = `# ResearchLens Multi-Paper Comparative Matrix\n\n`;
    md += `| Dimension | ${comparedPapers.map((p) => p.metadata?.title).join(' | ')} |\n`;
    md += `| --- | ${comparedPapers.map(() => '---').join(' | ')} |\n`;

    comparisonRows.forEach((row) => {
      md += `| **${row.aspect}** | ${comparedPapers
        .map((p) => row.getValue(p).replace(/\n/g, ' '))
        .join(' | ')} |\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multi_paper_comparison_matrix_${Date.now()}.md`;
    a.click();

    showToast({
      type: 'success',
      title: 'Matrix Exported',
      message: 'Comparative analysis matrix exported in Markdown format.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="violet">Cross-Paper Intelligence</Badge>
            <span className="text-xs font-mono text-slate-400">
              Comparing {comparedPapers.length} of {papers.length} Papers
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Multi-Paper Comparative Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Side-by-side methodological analysis, complexity benchmarks, and empirical limitations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            size="sm"
            onClick={handleExportMarkdown}
            disabled={comparedPapers.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Markdown</span>
          </Button>
          <Link href="/workspace/assistant">
            <Button variant="secondary" size="sm" className="gap-2">
              <Bot className="w-4 h-4 text-violet-400" />
              <span>Query Assistant</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Paper Checkbox Selector Strip */}
      <div className="p-4 rounded-2xl glass-panel space-y-3">
        <span className="text-xs font-mono text-slate-400 block font-semibold">
          Select Papers to Include in Comparison Matrix:
        </span>
        <div className="flex flex-wrap gap-2.5">
          {papers.map((p) => {
            const isSelected = selectedPaperIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleSelectPaper(p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-violet-600/20 border border-violet-500 text-violet-300 font-semibold shadow-glow'
                    : 'bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    isSelected ? 'bg-violet-500' : 'bg-slate-700'
                  }`}
                />
                <span className="truncate max-w-[200px]">{p.metadata?.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      {comparedPapers.length >= 2 ? (
        <Card variant="glass" className="p-6 overflow-x-auto">
          <div className="min-w-[850px]">
            {/* Header Columns */}
            <div
              className="grid gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-400"
              style={{
                gridTemplateColumns: `200px repeat(${comparedPapers.length}, minmax(220px, 1fr))`,
              }}
            >
              <span>DIMENSION</span>
              {comparedPapers.map((paper, idx) => (
                <div key={paper.id} className="space-y-1">
                  <span className="text-violet-400 font-bold block truncate">
                    {paper.metadata?.title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal block">
                    {paper.metadata?.journalOrVenue} ({paper.metadata?.publicationYear})
                  </span>
                </div>
              ))}
            </div>

            {/* Matrix Data Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {comparisonRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid gap-4 py-4 items-start"
                  style={{
                    gridTemplateColumns: `200px repeat(${comparedPapers.length}, minmax(220px, 1fr))`,
                  }}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block font-sans">
                      {row.aspect}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {row.description}
                    </span>
                  </div>

                  {comparedPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs"
                    >
                      {row.getValue(paper)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        /* Empty State */
        <Card variant="glass" className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Select At Least 2 Papers to Generate Comparison Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Choose two or more papers from the selector above to automatically construct side-by-side analysis grids.
          </p>
        </Card>
      )}

      {/* AI Synthesis Summary */}
      {comparedPapers.length >= 2 && (
        <Card variant="glass" className="p-6 border-violet-500/30 shadow-glow">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Comparative Synthesis & Methodological Divergence
            </h3>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            The comparative matrix reveals a clear architectural lineage:{' '}
            <strong className="text-white">Vaswani et al. (2017)</strong> established scaled dot-product attention but incurred an <code className="text-cyan-400 font-mono">O(n² · d)</code> complexity limitation. Subsequent breakthroughs address this either via hardware-aware execution—such as{' '}
            <strong className="text-white">FlashAttention (Dao et al., 2022)</strong> eliminating IO bottlenecks via GPU SRAM tiling—or via parameter efficiency, such as{' '}
            <strong className="text-white">LoRA (Hu et al., 2022)</strong> confining adaptation to low-rank updates.
          </p>
        </Card>
      )}
    </div>
  );
}
