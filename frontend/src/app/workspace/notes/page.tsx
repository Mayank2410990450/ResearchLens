'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  StickyNote,
  Plus,
  Search,
  Tag,
  Trash2,
  FileText,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useWorkspace } from '@/lib/workspaceStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function NotesPage() {
  const { notes, addNote, deleteNote, papers, setActiveReaderPaper, setActiveReaderPage } =
    useWorkspace();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Form states
  const [newTitle, setNewTitle] = React.useState('');
  const [newContent, setNewContent] = React.useState('');
  const [newTags, setNewTags] = React.useState('');
  const [newPaperId, setNewPaperId] = React.useState(papers[0]?.id || '');
  const [newPageNumber, setNewPageNumber] = React.useState(1);

  // Extract all distinct tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.contentMarkdown.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || n.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const paperObj = papers.find((p) => p.id === newPaperId);

    addNote({
      projectId: 'proj-transformers',
      paperId: newPaperId,
      paperTitle: paperObj?.metadata?.title,
      pageNumber: Number(newPageNumber),
      title: newTitle,
      contentMarkdown: newContent,
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsCreateModalOpen(false);

    showToast({
      type: 'success',
      title: 'Research Note Saved',
      message: 'Note attached to paper reference and indexed.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="verified">Scientific Annotation Store</Badge>
            <span className="text-xs font-mono text-slate-400">
              {notes.length} Saved Annotations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Research Notes & Highlights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personal annotations, excerpt highlights, and mathematical derivations anchored to paper pages.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 shadow-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Create Note</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl glass-panel space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-96">
            <Input
              placeholder="Search saved notes and excerpts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                selectedTag === 'all'
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                  selectedTag === tag
                    ? 'bg-violet-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card
            key={note.id}
            variant="glass"
            className="flex flex-col justify-between p-6 hover:border-violet-500/40 transition-all"
          >
            <div>
              {note.paperTitle && (
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="truncate max-w-[200px] text-violet-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {note.paperTitle}
                  </span>
                  <span>Page {note.pageNumber}</span>
                </div>
              )}

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {note.title}
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-4 whitespace-pre-line">
                {note.contentMarkdown}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {note.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <CardFooter className="justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {note.paperId ? (
                <Link href="/workspace/assistant">
                  <Button
                    variant="glass"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={() => {
                      const paperObj = papers.find((p) => p.id === note.paperId);
                      if (paperObj) {
                        setActiveReaderPaper(paperObj);
                        if (note.pageNumber) setActiveReaderPage(note.pageNumber);
                      }
                    }}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Jump to PDF</span>
                  </Button>
                </Link>
              ) : (
                <span className="text-[11px] font-mono text-slate-500">General Note</span>
              )}

              <button
                onClick={() => deleteNote(note.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Note Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Research Note & Excerpt"
        description="Anchor note directly to an academic paper"
      >
        <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
              Note Title:
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Scaling factor in dot product attention..."
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Attach to Paper:
              </label>
              <select
                value={newPaperId}
                onChange={(e) => setNewPaperId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {papers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.metadata?.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Target Page Number:
              </label>
              <input
                type="number"
                min="1"
                value={newPageNumber}
                onChange={(e) => setNewPageNumber(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
              Content (Markdown & Math):
            </label>
            <textarea
              required
              rows={4}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write observations, equations, or copy quoted excerpts..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
              Tags (comma separated):
            </label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="Attention, Softmax, Hardware"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
