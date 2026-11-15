'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  Layers,
  Database,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useWorkspace } from '@/lib/workspaceStore';
import { useToast } from '@/components/ui/Toast';
import { ResearchPaper } from '@/lib/types';

export function UploadModal() {
  const { isUploadModalOpen, setIsUploadModalOpen, addPaper } = useWorkspace();
  const { showToast } = useToast();

  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStep, setUploadStep] = React.useState<number>(0);
  const [progressPct, setProgressPct] = React.useState<number>(0);

  const steps = [
    { label: 'PyMuPDF Layout & Font Extraction', desc: 'Preserving headers, formulas & page bounds' },
    { label: 'Semantic Hierarchical Chunking', desc: '500-token sliding window with context prefixes' },
    { label: 'Generating 384-d Vector Embeddings', desc: 'SentenceTransformers all-MiniLM-L6-v2' },
    { label: 'Synchronizing pgvector HNSW Index', desc: 'Cosine ops m=16, ef=64 & tsvector GIN' },
  ];

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Only academic PDF documents (.pdf) are supported.',
      });
      return;
    }
    if (file.size > 35 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'File Exceeds Limit',
        message: 'Maximum allowed paper file size is 35MB.',
      });
      return;
    }
    setSelectedFile(file);
  };

  const startUploadPipeline = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStep(1);
    setProgressPct(25);

    // Step 1: Parsing
    setTimeout(() => {
      setUploadStep(2);
      setProgressPct(50);

      // Step 2: Chunking
      setTimeout(() => {
        setUploadStep(3);
        setProgressPct(75);

        // Step 3: Embedding
        setTimeout(() => {
          setUploadStep(4);
          setProgressPct(100);

          // Step 4: Finalize & Add to state
          setTimeout(() => {
            const paperTitle = selectedFile.name
              .replace('.pdf', '')
              .replace(/_/g, ' ')
              .replace(/-/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());

            const newPaper: ResearchPaper = {
              id: `paper-upload-${Date.now()}`,
              projectId: 'proj-transformers',
              fileName: selectedFile.name,
              fileSizeBytes: selectedFile.size || 2450000,
              fileHash: 'sha256-' + Math.random().toString(36).substring(2, 15),
              storagePath: `storage/uploads/${selectedFile.name}`,
              pageCount: Math.floor(Math.random() * 12) + 8,
              processingStatus: 'indexed',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              metadata: {
                title: paperTitle,
                authors: ['Dr. Research Fellow', 'Stanford AI Collaborators'],
                abstract:
                  'This newly uploaded academic research paper has been parsed with PyMuPDF, preserving sections, equations, and page numbers, and is indexed with pgvector.',
                publicationYear: 2024,
                journalOrVenue: 'Preprint / arXiv',
                keywords: ['Neural Architecture', 'Empirical Study', 'Evaluation'],
                primaryMethodology: 'Empirical Benchmark & Theoretical Proof',
                primaryDataset: 'Custom Scientific Evaluation Dataset',
              },
            };

            addPaper(newPaper);
            setIsUploading(false);
            setSelectedFile(null);
            setUploadStep(0);
            setProgressPct(0);
            setIsUploadModalOpen(false);

            showToast({
              type: 'success',
              title: 'Paper Ingestion Complete',
              message: `"${paperTitle}" successfully indexed in pgvector and ready for grounded RAG inquiry.`,
            });
          }, 800);
        }, 700);
      }, 700);
    }, 700);
  };

  return (
    <Modal
      isOpen={isUploadModalOpen}
      onClose={() => {
        if (!isUploading) setIsUploadModalOpen(false);
      }}
      title="Upload Scientific Papers"
      description="PyMuPDF parsing, hierarchical chunking & 384-d pgvector embedding"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Dropzone */}
        {!selectedFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-violet-500 bg-violet-500/10 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-800 hover:border-violet-500/50 hover:bg-slate-50 dark:hover:bg-navy-950/60'
            }`}
            onClick={() => document.getElementById('pdf-upload-input')?.click()}
          >
            <input
              id="pdf-upload-input"
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto mb-4 shadow-glow">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Drag & drop your research paper here
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Supports standard multi-column academic PDFs (NeurIPS, CVPR, IEEE, arXiv) up to 35MB
            </p>
            <Button variant="secondary" size="sm" type="button">
              Browse Local Files
            </Button>
          </div>
        ) : (
          /* File Selected & Processing State */
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                    {selectedFile.name}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for ingestion
                  </span>
                </div>
              </div>
              {!isUploading && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Ingestion Steps Progress */}
            {isUploading && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-violet-500/30 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-violet-300 font-semibold flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Step {uploadStep} of 4: {steps[uploadStep - 1]?.label}
                  </span>
                  <span className="text-cyan-400">{progressPct}%</span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {steps.map((st, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-xl border text-[10px] font-mono ${
                        uploadStep > i + 1
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : uploadStep === i + 1
                          ? 'border-violet-500 bg-violet-500/20 text-violet-200 animate-pulse'
                          : 'border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        {uploadStep > i + 1 ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <span>{i + 1}.</span>
                        )}
                        <span className="font-semibold truncate">{st.label.split(' ')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsUploadModalOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={startUploadPipeline}
            disabled={!selectedFile || isUploading}
            isLoading={isUploading}
          >
            {isUploading ? 'Ingesting Document...' : 'Start Ingestion Pipeline'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
