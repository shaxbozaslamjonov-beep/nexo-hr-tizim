import { Interview } from '@/types';
import { storageService } from './storageService';

const STORAGE_KEY = 'interviews';

export const interviewService = {
  getInterviews: async (): Promise<Interview[]> => {
    return storageService.get<Interview>(STORAGE_KEY);
  },

  getInterviewById: async (id: string): Promise<Interview | null> => {
    return storageService.findOne<Interview>(STORAGE_KEY, id);
  },

  createInterview: async (data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Promise<Interview> => {
    const newInterview: Interview = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return storageService.add<Interview>(STORAGE_KEY, newInterview);
  },

  updateInterview: async (id: string, updates: Partial<Interview>): Promise<Interview | null> => {
    const updated = storageService.update<Interview>(STORAGE_KEY, id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return updated;
  },

  deleteInterview: async (id: string): Promise<boolean> => {
    return storageService.delete(STORAGE_KEY, id);
  },

  getInterviewsByCandidate: async (candidateId: string): Promise<Interview[]> => {
    return storageService.findWhere<Interview>(STORAGE_KEY, (i) => i.candidateId === candidateId);
  },

  getInterviewsByStatus: async (status: Interview['status']): Promise<Interview[]> => {
    return storageService.findWhere<Interview>(STORAGE_KEY, (i) => i.status === status);
  },

  getInterviewsByDateRange: async (start: Date, end: Date): Promise<Interview[]> => {
    return storageService.findWhere<Interview>(STORAGE_KEY, (i) => {
      const date = new Date(i.scheduledDate);
      return date >= start && date <= end;
    });
  }
};
