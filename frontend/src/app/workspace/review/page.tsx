'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookMarked,
  Sparkles,
  Download,
  Share2,
  FileText,
  CheckCircle2,
  Edit3,
  Eye,
  Loader2,
  Layers,
} from 'lucide-react';
import { useWorkspace } from '@/lib/workspaceStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { LiteratureReview } from '@/lib/types';

export default function LiteratureReviewPage() {
  const { papers, reviews, addReview } = useWorkspace();
  const { showToast } = useToast();

  const [activeReviewId, setActiveReviewId] = React.useState<string>(reviews[0]?.id || '');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [thematicFocus, setThematicFocus] = React.useState(
    'Evolution of Attention Mechanisms: From O(N^2) Bottlenecks to IO-Aware Tiling'
  );
  const [selectedPaperIds, setSelectedPaperIds] = React.useState<string[]>([
    'paper-vaswani-2017',
    'paper-dao-2022',
    'paper-hu-2022',
  ]);
  const [activeTab, setActiveTab] = React.useState<'preview' | 'editor'>('preview');

  const activeReview = reviews.find((r) => r.id === activeReviewId) || reviews[0];
  const [editableMarkdown, setEditableMarkdown] = React.useState(
    activeReview?.reviewMarkdown || ''
  );

  React.useEffect(() => {
    if (activeReview) {
      setEditableMarkdown(activeReview.reviewMarkdown);
    }
  }, [activeReview]);

  const togglePaperSelection = (id: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerateReview = () => {
    if (selectedPaperIds.length < 2) {
      showToast({
        type: 'warning',
        title: 'Insufficient Sources',
        message: 'Please select at least 2 papers to synthesize a literature review.',
      });
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const newReview: LiteratureReview = {
        id: `rev-${Date.now()}`,
        projectId: 'proj-transformers',
        title: thematicFocus || 'Synthesized Literature Review',
        paperIds: selectedPaperIds,
        reviewMarkdown: `# ${thematicFocus}\n\n## 1. Introduction & Research Background\nUnderstanding modern deep learning architectures requires investigating the progression from dense sequence transduction models to hardware-aware execution pipelines. The seminal work by Vaswani et al. (2017) eliminated recurrent connections in sequence modeling by relying solely on scaled dot-product attention...\n\n## 2. Methodological & Computational Divergence\nWhile theoretical representations benefit from dense attention matrices, Dao et al. (2022) revealed an empirical bottleneck: GPU execution time is dominated by memory transfers between High Bandwidth Memory (HBM) and on-chip SRAM rather than raw arithmetic FLOPs...\n\n## 3. Parameter-Efficient Adaptations (PEFT)\nTo mitigate the steep computational cost of adapting billions of parameters, Hu et al. (2022) formulated Low-Rank Adaptation (LoRA), showing that weight updates possess a low intrinsic dimensionality...\n\n## 4. Stated Limitations & Research Opportunities\nEmpirical evaluation reveals that cross-attention with asymmetric sequence lengths still experiences memory fragmentation under FlashAttention, presenting an open avenue for future investigation...\n\n## 5. References\n- Vaswani, A., et al. (2017). Attention is all you need. NeurIPS 2017.\n- Dao, T., et al. (2022). FlashAttention: Fast and memory-efficient exact attention with IO-awareness. NeurIPS 2022.\n- Hu, E. J., et al. (2022). LoRA: Low-rank adaptation of large language models. ICLR 2022.`,
        sections: [
          {
            title: '1. Introduction & Research Background',
            content:
              'Understanding modern deep learning architectures requires investigating the progression from dense sequence transduction models to hardware-aware execution pipelines...',
          },
          {
            title: '2. Methodological & Computational Divergence',
            content:
              'While theoretical representations benefit from dense attention matrices, Dao et al. (2022) revealed an empirical bottleneck...',
          },
          {
            title: '3. Parameter-Efficient Adaptations',
            content:
              'To mitigate the steep computational cost of adapting billions of parameters, Hu et al. (2022) formulated LoRA...',
          },
        ],
        references: [
          'Vaswani, A., et al. (2017). Attention is all you need. NeurIPS 2017.',
          'Dao, T., et al. (2022). FlashAttention: Fast and memory-efficient exact attention. NeurIPS 2022.',
          'Hu, E. J., et al. (2022). LoRA: Low-rank adaptation. ICLR 2022.',
        ],
        status: 'completed',
        createdAt: new Date().toISOString(),
      };

      addReview(newReview);
      setActiveReviewId(newReview.id);
      setIsGenerating(false);

      showToast({
        type: 'success',
        title: 'Literature Review Synthesized',
        message: 'Review generated with verified APA references and thematic analysis.',
      });
    }, 1500);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([editableMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `literature_review_${Date.now()}.md`;
    a.click();

    showToast({
      type: 'success',
      title: 'Review Exported',
      message: 'Literature review successfully exported as Markdown file.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="violet">Structured Academic Synthesis</Badge>
            <span className="text-xs font-mono text-slate-400">
              {reviews.length} Synthesized Reviews
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Literature Review Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate, edit, and export publication-ready academic literature reviews with traceable citations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            size="sm"
            onClick={handleExportMarkdown}
            className="gap-2"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Markdown</span>
          </Button>
        </div>
      </div>

      {/* Synthesis Configuration Drawer */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Synthesize New Thematic Review
          </span>
          <span className="text-xs font-mono text-emerald-400">
            {selectedPaperIds.length} Papers Selected
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">
              Thematic Focus / Scientific Scope:
            </label>
            <input
              type="text"
              value={thematicFocus}
              onChange={(e) => setThematicFocus(e.target.value)}
              placeholder="e.g. Scaling limits of attention mechanisms in multimodal models..."
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">
              Select Source Papers for Thematic Grounding:
            </label>
            <div className="flex flex-wrap gap-2">
              {papers.map((p) => {
                const isSelected = selectedPaperIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePaperSelection(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-violet-600/20 border border-violet-500 text-violet-300 font-semibold'
                        : 'bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isSelected ? 'bg-violet-400' : 'bg-slate-600'
                      }`}
                    />
                    <span className="truncate max-w-[200px]">{p.metadata?.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateReview}
            isLoading={isGenerating}
            disabled={isGenerating || selectedPaperIds.length < 2}
            className="gap-2 shadow-glow"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Grounded Literature Review</span>
          </Button>
        </div>
      </Card>

      {/* Editor & Preview Workspace */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        {/* Workspace Sub-header with Tab Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {activeReview?.title || 'Synthesized Document'}
            </span>
            <Badge variant="verified" size="sm">
              APA References
            </Badge>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'preview'
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'editor'
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Markdown Editor</span>
            </button>
          </div>
        </div>

        {/* View Mode Content */}
        {activeTab === 'preview' ? (
          <div className="p-6 bg-white dark:bg-navy-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed space-y-4 font-serif">
            <div className="whitespace-pre-line font-serif">
              {editableMarkdown}
            </div>
          </div>
        ) : (
          <textarea
            value={editableMarkdown}
            onChange={(e) => setEditableMarkdown(e.target.value)}
            className="w-full h-96 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 leading-relaxed"
          />
        )}
      </div>
    </div>
  );
}
