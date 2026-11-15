'use client';

import * as React from 'react';
import {
  BookOpen,
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  ShieldCheck,
  RotateCcw,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { useWorkspace } from '@/lib/workspaceStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function AssistantPage() {
  const {
    papers,
    activeReaderPaper,
    setActiveReaderPaper,
    activeReaderPage,
    setActiveReaderPage,
    activeHighlightQuote,
    setActiveHighlightQuote,
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    isGeneratingResponse,
  } = useWorkspace();

  const { showToast } = useToast();

  const [inputQuery, setInputQuery] = React.useState('');
  const [zoomLevel, setZoomLevel] = React.useState(100);
  const [highlightGlow, setHighlightGlow] = React.useState(true);

  const activePaper = activeReaderPaper || papers[0];
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const handleCitationClick = (page: number, quote: string) => {
    setActiveReaderPage(page);
    setActiveHighlightQuote(quote);
    setHighlightGlow(true);
    showToast({
      type: 'success',
      title: 'Synchronized with Source Document',
      message: `Navigated to Page ${page}. Cited excerpt highlighted.`,
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isGeneratingResponse) return;
    sendMessage(inputQuery);
    setInputQuery('');
  };

  const suggestedQuestions = [
    'What is the computational complexity of self-attention vs recurrent layers?',
    'What hardware memory bottleneck does FlashAttention address on GPUs?',
    'How does LoRA decompose weight update matrices during fine-tuning?',
    'What are the stated limitations and failure cases reported by the authors?',
  ];

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4">
      {/* Top Paper Header Strip */}
      <div className="flex items-center justify-between p-3 rounded-2xl glass-panel text-xs">
        <div className="flex items-center gap-3 truncate">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="font-bold text-slate-900 dark:text-white truncate block">
              {activePaper.metadata?.title}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {activePaper.metadata?.journalOrVenue} • {activePaper.pageCount} Pages • {activePaper.metadata?.publicationYear}
            </span>
          </div>
        </div>

        {/* Paper Selector Dropdown */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={activePaper.id}
            onChange={(e) => {
              const selected = papers.find((p) => p.id === e.target.value);
              if (selected) {
                setActiveReaderPaper(selected);
                setActiveReaderPage(1);
              }
            }}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 max-w-[200px] truncate"
          >
            {papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.metadata?.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split Workspace View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        {/* Left Column: Interactive PDF Document Reader */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl glass-panel p-4 overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
          {/* Reader Toolbar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveReaderPage(Math.max(1, activeReaderPage - 1))}
                disabled={activeReaderPage <= 1}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                Page {activeReaderPage} of {activePaper.pageCount}
              </span>
              <button
                onClick={() =>
                  setActiveReaderPage(Math.min(activePaper.pageCount, activeReaderPage + 1))
                }
                disabled={activeReaderPage >= activePaper.pageCount}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span>{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ml-1"
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rendered Academic Document Canvas */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60 dark:bg-slate-950/90 rounded-xl my-3 border border-slate-200/80 dark:border-slate-800">
            <div
              className="max-w-2xl mx-auto space-y-6 font-serif text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {/* Document Header */}
              <div className="text-center pb-4 border-b border-slate-300 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  {activePaper.metadata?.journalOrVenue} • Publication Year: {activePaper.metadata?.publicationYear}
                </span>
                <h2 className="text-base sm:text-lg font-sans font-bold text-slate-900 dark:text-white">
                  {activePaper.metadata?.title}
                </h2>
                <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-1">
                  {activePaper.metadata?.authors.join(', ')}
                </p>
              </div>

              {/* Section 1 */}
              <div>
                <h3 className="font-sans font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Abstract & Problem Formulation
                </h3>
                <p className="text-justify leading-relaxed">
                  {activePaper.metadata?.abstract}
                </p>
              </div>

              {/* Dynamic Highlighted Passage on Target Page */}
              {activeHighlightQuote && (
                <div
                  className={`p-4 rounded-xl transition-all duration-500 ${
                    highlightGlow
                      ? 'bg-amber-500/20 dark:bg-amber-500/25 border-2 border-amber-500 shadow-glow text-slate-900 dark:text-amber-100'
                      : 'bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-amber-500 dark:text-amber-400 font-bold mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      [CITED PASSAGE • PAGE {activeReaderPage}]
                    </span>
                    <span>Verified Chunk Match</span>
                  </div>
                  <p className="font-sans font-medium text-xs leading-relaxed">
                    "{activeHighlightQuote}"
                  </p>
                </div>
              )}

              {/* Section 2 */}
              <div>
                <h3 className="font-sans font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Primary Methodology & Empirical Setup
                </h3>
                <p className="text-justify leading-relaxed mb-3">
                  The primary methodology applied in this paper is centered around{' '}
                  <span className="font-semibold text-violet-600 dark:text-violet-300">
                    {activePaper.metadata?.primaryMethodology}
                  </span>
                  . Experiments were conducted using standard scientific benchmark environments, predominantly evaluating on the{' '}
                  <span className="font-semibold text-cyan-600 dark:text-cyan-300">
                    {activePaper.metadata?.primaryDataset}
                  </span>{' '}
                  benchmark.
                </p>
              </div>
            </div>
          </div>

          {/* Reader Footer */}
          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>PyMuPDF Layout Extractor</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ground Truth Preserved
            </span>
          </div>
        </div>

        {/* Right Column: Grounded AI Assistant Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl glass-panel p-4 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          {/* Assistant Header & Grounding Assurance */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Grounded AI Assistant
                </span>
              </div>
              <Badge variant="verified" size="sm">
                Zero Hallucination Grounding
              </Badge>
            </div>

            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-300 mt-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Answers are synthesized strictly from retrieved document chunks with traceable page numbers.
              </span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 my-2">
            {activeConversation.messages.map((msg) => {
              const isUser = msg.senderRole === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-violet-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <span className="text-[10px] font-mono opacity-70 block mb-1">
                      {isUser ? 'Researcher' : 'ResearchLens Assistant'}
                    </span>
                    <div className="whitespace-pre-line font-sans">{msg.content}</div>

                    {/* Citations Box */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          Verified Document Evidence
                        </span>
                        {msg.citations.map((cit) => (
                          <div
                            key={cit.id}
                            onClick={() => handleCitationClick(cit.pageNumber, cit.exactQuote)}
                            className="cursor-pointer p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <span className="text-[11px] font-mono text-emerald-300 font-semibold truncate">
                                {cit.paperTitle} • Page {cit.pageNumber}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold ml-2">
                              {(cit.confidenceScore * 100).toFixed(0)}% Match
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isGeneratingResponse && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-violet-400 animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Hybrid RRF Retrieval & Cross-Encoder Reranking...</span>
              </div>
            )}
          </div>

          {/* Suggested Questions Pills */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block mb-1.5">
              Suggested Methodological Inquiries:
            </span>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {suggestedQuestions.slice(0, 2).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputQuery(q)}
                  className="text-[10px] text-left px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 transition-colors truncate max-w-full"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask questions about equations, datasets, or findings..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isGeneratingResponse}
                className="w-full h-11 pl-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="absolute right-1.5 h-8 w-8 p-0 rounded-lg"
                disabled={!inputQuery.trim() || isGeneratingResponse}
                aria-label="Send query"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
