import { Vacancy } from '@/types';

export const vacancyService = {
  // Barcha vakansiyalarni olish
  getVacancies: async (status?: string): Promise<Vacancy[]> => {
    const url = status && status !== 'ALL' ? `/api/vacancies?status=${status}` : '/api/vacancies';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch vacancies');
    return res.json();
  },

  // Bitta vakansiyani olish
  getVacancyById: async (id: string): Promise<Vacancy | null> => {
    const res = await fetch(`/api/vacancies/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  // Yangi vakansiya yaratish
  createVacancy: async (vacancyData: Omit<Vacancy, 'id' | 'createdAt' | 'candidatesCount' | 'status'>): Promise<Vacancy> => {
    const res = await fetch('/api/vacancies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vacancyData),
    });
    if (!res.ok) throw new Error('Failed to create vacancy');
    return res.json();
  },

  // Vakansiyani tahrirlash
  updateVacancy: async (id: string, updates: Partial<Vacancy>): Promise<Vacancy | null> => {
    const res = await fetch('/api/vacancies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) throw new Error('Failed to update vacancy');
    return res.json();
  },

  // Vakansiyani o'chirish
  deleteVacancy: async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/vacancies/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Status bo'yicha filtrlash
  getVacanciesByStatus: async (status: Vacancy['status'] | 'ALL'): Promise<Vacancy[]> => {
    return vacancyService.getVacancies(status);
  },

  // Kandidatlar sonini yangilash (Backend should handle this naturally via _count, but keeping helper if needed)
  updateCandidatesCount: async (vacancyId: string, count?: number): Promise<void> => {
    // This is mostly handled by the backend now, but we'll leave it as a partial update if needed.
    if (count !== undefined) {
      await vacancyService.updateVacancy(vacancyId, { candidatesCount: count });
    }
  }
};
