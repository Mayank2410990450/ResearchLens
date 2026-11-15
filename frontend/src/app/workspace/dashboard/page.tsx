'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
  BookOpen,
  Bot,
  Scale,
  Sparkles,
  BookMarked,
  StickyNote,
  ArrowUpRight,
  Database,
  TrendingUp,
  Layers,
  Clock,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useWorkspace } from '@/lib/workspaceStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const {
    papers,
    notes,
    reviews,
    gaps,
    setIsUploadModalOpen,
    setActiveReaderPaper,
  } = useWorkspace();

  const totalPages = papers.reduce((sum, p) => sum + p.pageCount, 0);

  // Real data-derived statistics for charts
  const methodologyCounts: Record<string, number> = {};
  papers.forEach((p) => {
    const meth = p.metadata?.primaryMethodology || 'Theoretical & Empirical';
    const shortMeth = meth.length > 20 ? meth.slice(0, 18) + '...' : meth;
    methodologyCounts[shortMeth] = (methodologyCounts[shortMeth] || 0) + 1;
  });

  const pieData = Object.entries(methodologyCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

  // Publication years
  const yearCounts: Record<number, number> = {};
  papers.forEach((p) => {
    const yr = p.metadata?.publicationYear || 2024;
    yearCounts[yr] = (yearCounts[yr] || 0) + 1;
  });

  const barData = Object.entries(yearCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, count]) => ({
      year,
      papers: count,
    }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="verified">Scientific Workspace Active</Badge>
            <span className="text-xs font-mono text-slate-400">pgvector HNSW Cosine Index</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Research Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time bibliometric metrics, grounded conversation status, and corpus distributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="gap-2 shadow-glow"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Paper</span>
          </Button>
          <Link href="/workspace/assistant">
            <Button variant="secondary" size="sm" className="gap-2">
              <Bot className="w-4 h-4 text-violet-400" />
              <span>Open AI Assistant</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card variant="glass" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Papers</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {papers.length}
            </span>
            <span className="text-xs font-mono text-emerald-400">100% Indexed</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            {totalPages} pages parsed with PyMuPDF
          </p>
        </Card>

        <Card variant="glass" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Literature Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {reviews.length}
            </span>
            <span className="text-xs font-mono text-cyan-400">Grounded</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Traceable academic citations
          </p>
        </Card>

        <Card variant="glass" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Research Gaps</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {gaps.length}
            </span>
            <span className="text-xs font-mono text-amber-400">Identified</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Author limits & AI hypotheses
          </p>
        </Card>

        <Card variant="glass" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Notes & Highlights</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <StickyNote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {notes.length}
            </span>
            <span className="text-xs font-mono text-emerald-400">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Linked to PDF page coordinates
          </p>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Publication Timeline */}
        <div className="lg:col-span-7">
          <Card variant="glass" className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-violet-400" />
                    Publication Year Distribution
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Temporal spread of indexed papers in current project
                  </CardDescription>
                </div>
                <Badge variant="violet" size="sm">
                  {papers.length} Papers
                </Badge>
              </div>

              <div className="h-56 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis
                      dataKey="year"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="papers" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
              <span>Span: 2016 – 2024</span>
              <span>Normalized corpus</span>
            </div>
          </Card>
        </div>

        {/* Methodology Taxonomy Donut */}
        <div className="lg:col-span-5">
          <Card variant="glass" className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Methodology Taxonomy
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Extracted algorithmic categories
                  </CardDescription>
                </div>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono">
              {pieData.map((item, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span>{item.name}</span>
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recently Ingested Papers & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Papers */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" />
              Recently Ingested Scientific Papers
            </h3>
            <Link
              href="/workspace/library"
              className="text-xs font-mono text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              <span>View All Library</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {papers.slice(0, 4).map((paper) => (
              <Card
                key={paper.id}
                variant="glass"
                className="hover:border-violet-500/30 transition-all p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <Badge variant="violet" size="sm">
                        {paper.metadata?.journalOrVenue}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-400">
                        {paper.pageCount} Pages
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {paper.metadata?.publicationYear}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {paper.metadata?.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                      Method: {paper.metadata?.primaryMethodology}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href="/workspace/assistant">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => setActiveReaderPaper(paper)}
                      >
                        <Bot className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                        Chat
                      </Button>
                    </Link>
                    <Link href="/workspace/assistant">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveReaderPaper(paper)}
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1 text-violet-400" />
                        Read
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Activity Feed */}
        <div className="lg:col-span-4">
          <Card variant="glass" className="p-5 h-full">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Clock className="w-4 h-4 text-emerald-400" />
              Recent Research Activity
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200 block">
                    Grounded Citation Verified
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Matched Section 3.2 on Page 4 of Attention Is All You Need.
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">12 mins ago</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200 block">
                    Literature Review Synthesized
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Generated review across 3 papers with APA citations.
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">2 hours ago</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200 block">
                    HNSW Vector Index Updated
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Embedded FlashAttention into 384-dimensional cosine index.
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">Yesterday</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
