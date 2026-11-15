'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  Grid,
  List,
  UploadCloud,
  Bot,
  BookOpen,
  Scale,
  Trash2,
  CheckCircle2,
  Tag,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { useWorkspace } from '@/lib/workspaceStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function LibraryPage() {
  const {
    papers,
    deletePaper,
    selectedPaperIds,
    toggleSelectPaper,
    clearSelectedPapers,
    setActiveReaderPaper,
    setIsUploadModalOpen,
  } = useWorkspace();

  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedYear, setSelectedYear] = React.useState<string>('all');
  const [selectedVenue, setSelectedVenue] = React.useState<string>('all');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = React.useState<'year' | 'title' | 'pages'>('year');

  // Extract distinct venues and years
  const venues = Array.from(
    new Set(papers.map((p) => p.metadata?.journalOrVenue).filter(Boolean))
  );
  const years = Array.from(
    new Set(papers.map((p) => p.metadata?.publicationYear).filter(Boolean))
  ).sort((a, b) => (b as number) - (a as number));

  // Filter & Sort
  const filteredPapers = papers
    .filter((paper) => {
      const titleMatch = paper.metadata?.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const authorMatch = paper.metadata?.authors.some((a) =>
        a.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const keywordMatch = paper.metadata?.keywords.some((k) =>
        k.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const methMatch = paper.metadata?.primaryMethodology
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const queryMatches = titleMatch || authorMatch || keywordMatch || methMatch;

      const yearMatches =
        selectedYear === 'all' ||
        String(paper.metadata?.publicationYear) === selectedYear;

      const venueMatches =
        selectedVenue === 'all' || paper.metadata?.journalOrVenue === selectedVenue;

      return queryMatches && yearMatches && venueMatches;
    })
    .sort((a, b) => {
      if (sortBy === 'year') {
        return (b.metadata?.publicationYear || 0) - (a.metadata?.publicationYear || 0);
      }
      if (sortBy === 'title') {
        return (a.metadata?.title || '').localeCompare(b.metadata?.title || '');
      }
      return b.pageCount - a.pageCount;
    });

  const handleDelete = (id: string, title?: string) => {
    deletePaper(id);
    showToast({
      type: 'info',
      title: 'Paper Removed',
      message: `"${title || 'Paper'}" and its vector embeddings removed from library.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="violet">Document Management</Badge>
            <span className="text-xs font-mono text-slate-400">
              {papers.length} Papers Total
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Research Paper Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, tag, and inspect parsed scientific documents and extracted metadata.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedPaperIds.length > 0 && (
            <Link href="/workspace/comparison">
              <Button variant="secondary" size="sm" className="gap-1.5 border-violet-500/40">
                <Scale className="w-3.5 h-3.5 text-violet-400" />
                <span>Compare Selected ({selectedPaperIds.length})</span>
              </Button>
            </Link>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="gap-2 shadow-glow"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload PDF</span>
          </Button>
        </div>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="p-4 rounded-2xl glass-panel space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="w-full md:w-96">
            <Input
              placeholder="Search by title, author, keyword, or methodology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Filter Dropdowns & View Toggles */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Years</option>
              {years.map((y) => (
                <option key={String(y)} value={String(y)}>
                  Year {y}
                </option>
              ))}
            </select>

            {/* Venue Selector */}
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 max-w-[160px] truncate"
            >
              <option value="all">All Venues</option>
              {venues.map((v) => (
                <option key={String(v)} value={String(v)}>
                  {v}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="year">Sort: Year (Newest)</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="pages">Sort: Page Count</option>
            </select>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Counter & Clear Action */}
        {selectedPaperIds.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono text-slate-400">
            <span>{selectedPaperIds.length} paper(s) selected for cross-comparison</span>
            <button
              onClick={clearSelectedPapers}
              className="text-violet-400 hover:text-violet-300 underline"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => {
            const isSelected = selectedPaperIds.includes(paper.id);
            return (
              <Card
                key={paper.id}
                variant="glass"
                className={`flex flex-col justify-between transition-all duration-200 ${
                  isSelected ? 'border-violet-500 shadow-glow' : 'hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Bar with Selection Checkbox */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="violet" size="sm">
                        {paper.metadata?.journalOrVenue}
                      </Badge>
                      <Badge variant="verified" size="sm">
                        {paper.pageCount} Pages
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-400">
                        {paper.metadata?.publicationYear}
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectPaper(paper.id)}
                      className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 mt-1 cursor-pointer"
                      title="Select for multi-paper comparison"
                    />
                  </div>

                  {/* Title & Authors */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mb-1.5">
                    {paper.metadata?.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate mb-3">
                    {paper.metadata?.authors.join(', ')}
                  </p>

                  {/* Abstract Snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {paper.metadata?.abstract}
                  </p>

                  {/* Methodology Tag */}
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-4">
                    <span className="text-violet-400 font-semibold block mb-0.5">
                      Methodology:
                    </span>
                    <span className="truncate block">
                      {paper.metadata?.primaryMethodology}
                    </span>
                  </div>

                  {/* Keywords Pills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {paper.metadata?.keywords.slice(0, 3).map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <CardFooter className="justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
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

                  <button
                    onClick={() => handleDelete(paper.id, paper.metadata?.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete paper from workspace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredPapers.map((paper) => {
            const isSelected = selectedPaperIds.includes(paper.id);
            return (
              <Card
                key={paper.id}
                variant="glass"
                className={`p-4 transition-all ${
                  isSelected ? 'border-violet-500 shadow-glow' : 'hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 max-w-3xl">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectPaper(paper.id)}
                      className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 mt-1 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="violet" size="sm">
                          {paper.metadata?.journalOrVenue}
                        </Badge>
                        <span className="text-xs font-mono text-slate-400">
                          {paper.metadata?.publicationYear}
                        </span>
                        <span className="text-xs font-mono text-emerald-400">
                          {paper.pageCount} Pages
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {paper.metadata?.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {paper.metadata?.authors.join(', ')} • Method: {paper.metadata?.primaryMethodology}
                      </p>
                    </div>
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
                    <button
                      onClick={() => handleDelete(paper.id, paper.metadata?.title)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
