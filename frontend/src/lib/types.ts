// ResearchLens Core TypeScript Types & Interfaces

export type ProcessingStatus = 'pending' | 'parsing' | 'chunking' | 'embedding' | 'indexed' | 'failed';

export interface Author {
  name: string;
  affiliation?: string;
}

export interface PaperMetadata {
  title: string;
  authors: string[];
  abstract: string;
  publicationYear: number;
  journalOrVenue: string;
  doi?: string;
  keywords: string[];
  primaryMethodology: string;
  primaryDataset: string;
}

export interface ResearchPaper {
  id: string;
  projectId: string;
  fileName: string;
  fileSizeBytes: number;
  fileHash: string;
  storagePath: string;
  pageCount: number;
  processingStatus: ProcessingStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: PaperMetadata;
}

export interface DocumentChunk {
  id: string;
  paperId: string;
  chunkIndex: number;
  pageNumber: number;
  sectionTitle?: string;
  content: string;
  tokenCount: number;
}

export interface Citation {
  id: string;
  messageId: string;
  chunkId: string;
  paperId: string;
  paperTitle: string;
  pageNumber: number;
  sectionTitle?: string;
  exactQuote: string;
  confidenceScore: number;
  verificationStatus: 'verified' | 'unverified' | 'ai_hypothesis';
}

export interface Message {
  id: string;
  conversationId: string;
  senderRole: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  projectId: string;
  paperId?: string | null;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonMatrixRow {
  aspect: string;
  description: string;
  values: Record<string, string>; // paperId -> extracted aspect description
  citations: Record<string, Citation>; // paperId -> proof citation
}

export interface ResearchGap {
  id: string;
  title: string;
  category: 'author_reported_limitation' | 'experimental_divergence' | 'ai_hypothesized_gap';
  description: string;
  supportingPaperIds: string[];
  citations: Citation[];
  confidenceScore: number;
}

export interface ResearchNote {
  id: string;
  projectId: string;
  paperId?: string;
  paperTitle?: string;
  pageNumber?: number;
  title: string;
  contentMarkdown: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LiteratureReview {
  id: string;
  projectId: string;
  title: string;
  paperIds: string[];
  reviewMarkdown: string;
  sections: {
    title: string;
    content: string;
  }[];
  references: string[];
  status: 'completed' | 'generating' | 'failed';
  createdAt: string;
}
