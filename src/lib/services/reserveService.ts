import { ReserveCandidate } from '@/types';
import { storageService } from './storageService';

const STORAGE_KEY = 'reserve_pool';

export const reserveService = {
  getReserveList: async (): Promise<ReserveCandidate[]> => {
    return storageService.get<ReserveCandidate>(STORAGE_KEY);
  },

  getReserveCandidateById: async (id: string): Promise<ReserveCandidate | null> => {
    return storageService.findOne<ReserveCandidate>(STORAGE_KEY, id);
  },

  addToReserve: async (data: Omit<ReserveCandidate, 'id' | 'addedAt' | 'updatedAt'>): Promise<ReserveCandidate> => {
    const newReserve: ReserveCandidate = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return storageService.add<ReserveCandidate>(STORAGE_KEY, newReserve);
  },

  updateReserveStatus: async (id: string, status: ReserveCandidate['status']): Promise<ReserveCandidate | null> => {
    return storageService.update<ReserveCandidate>(STORAGE_KEY, id, {
      status,
      updatedAt: new Date().toISOString(),
    });
  },

  removeFromReserve: async (id: string): Promise<boolean> => {
    return storageService.delete(STORAGE_KEY, id);
  }
};
