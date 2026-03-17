import { Candidate } from '@/types';

export const candidateService = {
  getLatestCandidates: async (limit: number = 5): Promise<Candidate[]> => {
    const res = await fetch(`/api/candidates`);
    if (!res.ok) throw new Error('Failed to fetch candidates');
    const data = await res.json();
    return data
      .sort((a: Candidate, b: Candidate) => {
        const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
        const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  },

  getAllCandidates: async (status?: string): Promise<Candidate[]> => {
    const url = status ? `/api/candidates?status=${status}` : '/api/candidates';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch candidates');
    return res.json();
  },

  getCandidateById: async (id: string): Promise<Candidate | null> => {
    // Note: This endpoint might need to be implemented or handled via GET /api/candidates/[id]
    const res = await fetch(`/api/candidates`);
    const all: Candidate[] = await res.json();
    return all.find((c: Candidate) => c.id === id) || null;
  },

  updateCandidate: async (id: string, updates: Partial<Candidate>): Promise<Candidate | null> => {
    const res = await fetch(`/api/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update candidate');
    return res.json();
  },

  deleteCandidate: async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  createCandidate: async (data: Partial<Candidate>): Promise<Candidate> => {
    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create candidate');
    return res.json();
  },

  getCandidatesByVacancy: async (vacancyId: string): Promise<Candidate[]> => {
    const res = await fetch(`/api/candidates?vacancyId=${vacancyId}`);
    if (!res.ok) throw new Error('Failed to fetch candidates');
    return res.json();
  }
};
