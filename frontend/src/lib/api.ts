/**
 * ResearchLens Unified API Client
 * Connects frontend UI to FastAPI backend with graceful fallback.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class APIClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('researchlens_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('researchlens_token', token);
      } else {
        localStorage.removeItem('researchlens_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('researchlens_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }
    if (res.status === 204) {
      return null as T;
    }
    return res.json();
  }

  // Auth
  async register(data: { email: string; password: string; full_name: string; institution?: string }) {
    const res = await this.request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: { email: string; password: string }) {
    const res = await this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Projects
  async getProjects() {
    return this.request<any[]>('/projects');
  }

  async createProject(data: { title: string; description?: string; research_field?: string }) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Papers
  async getPapers(projectId: string, search?: string, year?: number) {
    let url = `/papers?project_id=${projectId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (year) url += `&year=${year}`;
    return this.request<any[]>(url);
  }

  async uploadPaper(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('project_id', projectId);
    formData.append('file', file);
    return this.request<any>('/papers/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deletePaper(paperId: string) {
    return this.request<void>(`/papers/${paperId}`, { method: 'DELETE' });
  }

  getPaperPdfUrl(paperId: string) {
    return `${API_BASE_URL}/papers/${paperId}/pdf`;
  }

  // Chat & AI Assistant
  async getConversations(projectId: string, paperId?: string) {
    let url = `/chat/conversations?project_id=${projectId}`;
    if (paperId) url += `&paper_id=${paperId}`;
    return this.request<any[]>(url);
  }

  async createConversation(data: { project_id: string; paper_id?: string; title?: string }) {
    return this.request<any>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async queryChat(data: { conversation_id: string; message: string; paper_ids?: string[] }) {
    return this.request<any>('/chat/query', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notes
  async getNotes(projectId: string, paperId?: string) {
    let url = `/notes?project_id=${projectId}`;
    if (paperId) url += `&paper_id=${paperId}`;
    return this.request<any[]>(url);
  }

  async createNote(data: { project_id: string; paper_id?: string; title: string; content_markdown: string; tags?: string[] }) {
    return this.request<any>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteNote(noteId: string) {
    return this.request<void>(`/notes/${noteId}`, { method: 'DELETE' });
  }

  // Collections
  async getCollections(projectId: string) {
    return this.request<any[]>(`/collections?project_id=${projectId}`);
  }

  async createCollection(projectId: string, data: { name: string; description?: string; color_hex?: string }) {
    return this.request<any>(`/collections?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Dashboard Stats
  async getDashboardStats(projectId?: string) {
    const url = projectId ? `/dashboard/stats?project_id=${projectId}` : '/dashboard/stats';
    return this.request<any>(url);
  }

  // Multi-Paper Comparison
  async generateComparison(data: { project_id: string; title: string; paper_ids: string[] }) {
    return this.request<any>('/comparison/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Research Gaps
  async analyzeGaps(projectId: string) {
    return this.request<any>('/gaps/analyze', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    });
  }

  // Literature Review
  async generateReview(data: { project_id: string; title: string; paper_ids: string[] }) {
    return this.request<any>('/review/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Settings
  async getSettings() {
    return this.request<any>('/settings');
  }

  async updateSettings(data: any) {
    return this.request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const api = new APIClient();
