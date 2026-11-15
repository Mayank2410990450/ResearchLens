'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  StickyNote,
  Bot,
  Filter,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useWorkspace } from '@/lib/workspaceStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function GapExplorerPage() {
  const { gaps, addNote, setActiveHighlightQuote, setActiveReaderPaper, papers } =
    useWorkspace();
  const { showToast } = useToast();

  const [activeCategory, setActiveCategory] = React.useState<string>('all');

  const filteredGaps = gaps.filter(
    (g) => activeCategory === 'all' || g.category === activeCategory
  );

  const handleSaveToNotes = (gap: (typeof gaps)[0]) => {
    addNote({
      projectId: 'proj-transformers',
      title: `Research Gap: ${gap.title}`,
      contentMarkdown: `### ${gap.title}\n\n**Category:** ${gap.category}\n\n${gap.description}\n\n${
        gap.citations.length > 0
          ? `**Supporting Source Excerpt:**\n> ${gap.citations[0].exactQuote}\n*(Source: ${gap.citations[0].paperTitle}, Page ${gap.citations[0].pageNumber})*`
          : '*AI-Hypothesized Opportunity based on cross-paper divergence.*'
      }`,
      tags: ['Research Gap', 'Opportunity', 'Hypothesis'],
    });

    showToast({
      type: 'success',
      title: 'Gap Saved to Research Notes',
      message: `"${gap.title}" has been appended to your notes workspace.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="hypothesis">Scientific Discovery Engine</Badge>
            <span className="text-xs font-mono text-slate-400">
              {gaps.length} Gaps Analyzed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Research Gap Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cross-paper discovery engine separating author-reported limitations from AI-hypothesized research opportunities.
          </p>
        </div>

        <Link href="/workspace/review">
          <Button variant="primary" size="sm" className="gap-2 shadow-glow">
            <Sparkles className="w-4 h-4" />
            <span>Generate Literature Review</span>
          </Button>
        </Link>
      </div>

      {/* Epistemological Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Scientific Methodology Disclaimer:</strong> Identified research gaps reflect analysis of your uploaded project papers. ResearchLens strictly distinguishes verified author-reported limitations from AI-synthesized hypotheses. Never claim a gap is globally novel based solely on a bounded collection.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All Identified Gaps' },
          { id: 'author_reported_limitation', label: 'Author-Reported Limitations (Ground Truth)' },
          { id: 'experimental_divergence', label: 'Experimental Setup Divergences' },
          { id: 'ai_hypothesized_gap', label: 'AI Hypothesized Opportunities' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === tab.id
                ? 'bg-violet-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGaps.map((gap) => {
          const isGroundTruth = gap.category === 'author_reported_limitation';
          const isDivergence = gap.category === 'experimental_divergence';

          return (
            <Card
              key={gap.id}
              variant="glass"
              className={`flex flex-col justify-between p-6 ${
                isGroundTruth
                  ? 'border-emerald-500/30 shadow-glow-emerald'
                  : isDivergence
                  ? 'border-cyan-500/30 shadow-glow-cyan'
                  : 'border-amber-500/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant={isGroundTruth ? 'verified' : isDivergence ? 'cyan' : 'hypothesis'}
                  >
                    {isGroundTruth
                      ? 'Author-Reported Ground Truth'
                      : isDivergence
                      ? 'Corpus Setup Divergence'
                      : 'AI-Hypothesized Opportunity'}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">
                    {(gap.confidenceScore * 100).toFixed(0)}% Confidence
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {gap.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {gap.description}
                </p>

                {/* Citations Box */}
                {gap.citations.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1.5 mb-4 font-mono text-[11px]">
                    <span className="text-emerald-500 font-semibold block">
                      Verifiable Author Citation:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 italic font-sans text-xs">
                      "{gap.citations[0].exactQuote}"
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Source: {gap.citations[0].paperTitle} (Page {gap.citations[0].pageNumber})
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <CardFooter className="justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handleSaveToNotes(gap)}
                  className="gap-1.5"
                >
                  <StickyNote className="w-3.5 h-3.5 text-violet-400" />
                  <span>Save to Notes</span>
                </Button>

                <Link href="/workspace/assistant">
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Inquire with AI</span>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
