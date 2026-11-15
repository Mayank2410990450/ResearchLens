'use client';

import * as React from 'react';
import {
  ResearchPaper,
  ResearchNote,
  ResearchGap,
  LiteratureReview,
  Conversation,
  Message,
  Citation,
} from './types';
import { MOCK_PAPERS, MOCK_RESEARCH_GAPS as MOCK_GAPS, MOCK_NOTES } from './mockData';

interface WorkspaceContextType {
  // Papers & Library
  papers: ResearchPaper[];
  addPaper: (paper: ResearchPaper) => void;
  deletePaper: (id: string) => void;
  selectedPaperIds: string[];
  toggleSelectPaper: (id: string) => void;
  clearSelectedPapers: () => void;

  // Active Reader State
  activeReaderPaper: ResearchPaper | null;
  setActiveReaderPaper: (paper: ResearchPaper | null) => void;
  activeReaderPage: number;
  setActiveReaderPage: (page: number) => void;
  activeHighlightQuote: string | null;
  setActiveHighlightQuote: (quote: string | null) => void;

  // Chat & Conversation
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  sendMessage: (content: string) => void;
  isGeneratingResponse: boolean;

  // Notes
  notes: ResearchNote[];
  addNote: (note: Omit<ResearchNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteNote: (id: string) => void;

  // Literature Reviews
  reviews: LiteratureReview[];
  addReview: (review: LiteratureReview) => void;

  // Gaps
  gaps: ResearchGap[];

  // Global Modals
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Active Project
  activeProjectTitle: string;
  setActiveProjectTitle: (title: string) => void;
}

const WorkspaceContext = React.createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [papers, setPapers] = React.useState<ResearchPaper[]>(MOCK_PAPERS);
  const [selectedPaperIds, setSelectedPaperIds] = React.useState<string[]>([
    'paper-vaswani-2017',
    'paper-dao-2022',
  ]);
  const [activeReaderPaper, setActiveReaderPaper] = React.useState<ResearchPaper | null>(
    MOCK_PAPERS[0]
  );
  const [activeReaderPage, setActiveReaderPage] = React.useState<number>(4);
  const [activeHighlightQuote, setActiveHighlightQuote] = React.useState<string | null>(
    'Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V'
  );

  const [notes, setNotes] = React.useState<ResearchNote[]>(MOCK_NOTES);
  const [gaps] = React.useState<ResearchGap[]>(MOCK_GAPS);

  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);
  const [activeProjectTitle, setActiveProjectTitle] = React.useState(
    'Efficiency in Transformer & Multimodal Architectures'
  );

  // Initial Conversations
  const initialConversations: Conversation[] = [
    {
      id: 'conv-transformer-foundations',
      projectId: 'proj-transformers',
      paperId: 'paper-vaswani-2017',
      title: 'Attention Mechanism & Complexity Bounds',
      createdAt: '2026-11-10T10:00:00Z',
      updatedAt: '2026-11-10T10:15:00Z',
      messages: [
        {
          id: 'msg-1',
          conversationId: 'conv-transformer-foundations',
          senderRole: 'user',
          content:
            'What is the computational complexity difference per layer between self-attention and recurrent layers according to the paper?',
          createdAt: '2026-11-10T10:01:00Z',
        },
        {
          id: 'msg-2',
          conversationId: 'conv-transformer-foundations',
          senderRole: 'assistant',
          content:
            'According to Table 1 in Vaswani et al. (p. 6), self-attention layers exhibit a computational complexity per layer of **O(n² · d)** with sequential operations of **O(1)**. In contrast, recurrent layers require **O(n · d²)** complexity with **O(n)** sequential operations, creating a parallelization bottleneck during sequence processing.\n\nWhen sequence length `n` is smaller than the representation dimension `d`, self-attention layers are significantly faster than recurrent operations.',
          citations: [
            {
              id: 'cit-1',
              messageId: 'msg-2',
              chunkId: 'chunk-table-1',
              paperId: 'paper-vaswani-2017',
              paperTitle: 'Attention Is All You Need',
              pageNumber: 6,
              sectionTitle: 'Table 1: Maximum path lengths and layer complexity',
              exactQuote:
                'Self-Attention: O(n^2 * d) complexity per layer, O(1) sequential operations, O(1) maximum path length. Recurrent: O(n * d^2) complexity, O(n) sequential operations.',
              confidenceScore: 0.98,
              verificationStatus: 'verified',
            },
          ],
          createdAt: '2026-11-10T10:01:30Z',
        },
      ],
    },
    {
      id: 'conv-flashattn-memory',
      projectId: 'proj-transformers',
      paperId: 'paper-dao-2022',
      title: 'FlashAttention SRAM vs HBM Analysis',
      createdAt: '2026-11-12T14:00:00Z',
      updatedAt: '2026-11-12T14:20:00Z',
      messages: [
        {
          id: 'msg-3',
          conversationId: 'conv-flashattn-memory',
          senderRole: 'user',
          content: 'How does FlashAttention avoid quadratic memory reads on GPU HBM?',
          createdAt: '2026-11-12T14:01:00Z',
        },
        {
          id: 'msg-4',
          conversationId: 'conv-flashattn-memory',
          senderRole: 'assistant',
          content:
            'FlashAttention solves the GPU memory bottleneck through **block tiling** and **online softmax recomputation**. Instead of materializing the entire N x N attention matrix into High Bandwidth Memory (HBM), it loads blocks of queries, keys, and values into fast on-chip SRAM, computes attention incrementally, and scales intermediate statistics dynamically.',
          citations: [
            {
              id: 'cit-2',
              messageId: 'msg-4',
              chunkId: 'chunk-dao-algo',
              paperId: 'paper-dao-2022',
              paperTitle: 'FlashAttention: Fast and Memory-Efficient Exact Attention',
              pageNumber: 3,
              sectionTitle: '3. FlashAttention Algorithm',
              exactQuote:
                'FlashAttention reduces the number of HBM accesses from O(N^2) to O(N * d^2 / M) where M is the size of SRAM, achieving 2-4x wall-clock speedup.',
              confidenceScore: 0.95,
              verificationStatus: 'verified',
            },
          ],
          createdAt: '2026-11-12T14:01:45Z',
        },
      ],
    },
  ];

  const [conversations, setConversations] = React.useState<Conversation[]>(
    initialConversations
  );
  const [activeConversationId, setActiveConversationId] = React.useState<string>(
    initialConversations[0].id
  );
  const [isGeneratingResponse, setIsGeneratingResponse] = React.useState(false);

  // Reviews
  const [reviews, setReviews] = React.useState<LiteratureReview[]>([
    {
      id: 'rev-001',
      projectId: 'proj-transformers',
      title: 'Architectural Evolution from Dense Attention to IO-Aware Hardware Tiling',
      paperIds: ['paper-vaswani-2017', 'paper-dao-2022', 'paper-hu-2022'],
      reviewMarkdown:
        '# Architectural Evolution from Dense Attention to IO-Aware Hardware Tiling\n\n## 1. Introduction & Background\nThe emergence of the Transformer architecture (Vaswani et al., 2017) fundamentally transformed neural sequence modeling by eliminating sequential recurrence in favor of multi-head scaled dot-product attention...\n\n## 2. Hardware Memory IO Bottlenecks\nWhile theoretical complexity scales quadratically with sequence length n (O(n²)), Dao et al. (2022) revealed that the empirical execution bottleneck on modern GPUs is memory bandwidth between DRAM/HBM and SRAM...',
      sections: [
        {
          title: '1. Introduction & Background',
          content:
            'The emergence of the Transformer architecture (Vaswani et al., 2017) fundamentally transformed neural sequence modeling by eliminating sequential recurrence in favor of multi-head scaled dot-product attention...',
        },
        {
          title: '2. Hardware Memory IO Bottlenecks',
          content:
            'While theoretical complexity scales quadratically with sequence length n (O(n²)), Dao et al. (2022) revealed that the empirical execution bottleneck on modern GPUs is memory bandwidth between DRAM/HBM and SRAM...',
        },
        {
          title: '3. Parameter-Efficient Adaptations',
          content:
            'To mitigate prohibitive re-training compute, Hu et al. (2022) formulated LoRA, demonstrating that weight updates reside on a low intrinsic dimensional manifold...',
        },
      ],
      references: [
        'Vaswani, A., et al. (2017). Attention is all you need. Advances in Neural Information Processing Systems, 30.',
        'Dao, T., et al. (2022). FlashAttention: Fast and memory-efficient exact attention with IO-awareness. NeurIPS 2022.',
        'Hu, E. J., et al. (2022). LoRA: Low-rank adaptation of large language models. ICLR 2022.',
      ],
      status: 'completed',
      createdAt: '2026-11-14T16:00:00Z',
    },
  ]);

  // Paper Handlers
  const addPaper = (paper: ResearchPaper) => {
    setPapers((prev) => [paper, ...prev]);
  };

  const deletePaper = (id: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== id));
    setSelectedPaperIds((prev) => prev.filter((pId) => pId !== id));
    if (activeReaderPaper?.id === id) {
      setActiveReaderPaper(papers.find((p) => p.id !== id) || null);
    }
  };

  const toggleSelectPaper = (id: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelectedPapers = () => setSelectedPaperIds([]);

  // Note Handlers
  const addNote = (newNote: Omit<ResearchNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const note: ResearchNote = {
      ...newNote,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Review Handlers
  const addReview = (review: LiteratureReview) => {
    setReviews((prev) => [review, ...prev]);
  };

  // Chat Message Sending Handler with Grounded Synthesis Simulation
  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      conversationId: activeConversationId,
      senderRole: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, userMsg], updatedAt: new Date().toISOString() }
          : c
      )
    );

    setIsGeneratingResponse(true);

    // Simulated Grounded Multi-Stage Retrieval & Verification Delay
    setTimeout(() => {
      // Find relevant mock paper context
      const targetPaper = activeReaderPaper || papers[0];
      const assistantMsg: Message = {
        id: `msg-assistant-${Date.now()}`,
        conversationId: activeConversationId,
        senderRole: 'assistant',
        content: `Based on an analysis of **${targetPaper.metadata?.title}** (${targetPaper.metadata?.journalOrVenue}):\n\nThe authors address this by leveraging **${targetPaper.metadata?.primaryMethodology}**. Specifically, empirical evaluations on the **${targetPaper.metadata?.primaryDataset}** dataset validate this hypothesis.\n\nEvery factual assertion here is verified against retrieved chunks stored in pgvector.`,
        citations: [
          {
            id: `cit-${Date.now()}`,
            messageId: `msg-assistant-${Date.now()}`,
            chunkId: `chunk-${targetPaper.id}-p4`,
            paperId: targetPaper.id,
            paperTitle: targetPaper.metadata?.title || 'Scientific Paper',
            pageNumber: 4,
            sectionTitle: 'Section 3. Methodology & Results',
            exactQuote: targetPaper.metadata?.abstract.slice(0, 180) + '...',
            confidenceScore: 0.96,
            verificationStatus: 'verified',
          },
        ],
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: new Date().toISOString() }
            : c
        )
      );
      setIsGeneratingResponse(false);
    }, 1200);
  };

  // Global Keyboard Shortcuts (Ctrl+K for Command Palette)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        papers,
        addPaper,
        deletePaper,
        selectedPaperIds,
        toggleSelectPaper,
        clearSelectedPapers,

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

        notes,
        addNote,
        deleteNote,

        reviews,
        addReview,

        gaps,

        isUploadModalOpen,
        setIsUploadModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,

        activeProjectTitle,
        setActiveProjectTitle,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = React.useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
