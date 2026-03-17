import { EmployeeProfile, User, UserSettings } from '@/types';

const DEFAULT_SETTINGS: UserSettings = {
  language: 'uz',
  dateFormat: 'dd.mm.yyyy',
  timeFormat: '24h',
  notifications: {
    email: true,
    push: true,
    interviewReminders: true,
    newApplications: true,
    assignmentGraded: true,
  },
  theme: 'system',
};

export const employeeService = {
  getAllEmployees: async (): Promise<(EmployeeProfile & { user: User })[]> => {
    try {
      const res = await fetch('/api/employees');
      if (!res.ok) throw new Error('Failed to fetch employees');
      return await res.json();
    } catch (error) {
      console.error('Error in getAllEmployees:', error);
      return [];
    }
  },

  getProfileByUserId: async (userId: string): Promise<(EmployeeProfile & { user: User }) | null> => {
    try {
      const res = await fetch(`/api/employees?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.find((emp: EmployeeProfile & { user: User }) => emp.userId === userId) || null;
      }
      return data;
    } catch (error) {
      console.error('Error in getProfileByUserId:', error);
      return null;
    }
  },

  updateEmployee: async (userId: string, updates: Partial<EmployeeProfile>): Promise<boolean> => {
    try {
      const res = await fetch('/api/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });
      return res.ok;
    } catch (error) {
      console.error('Error in updateEmployee:', error);
      return false;
    }
  },

  assignLesson: async (userId: string, lessonId: string): Promise<void> => {
    // This might need a separate API endpoint or be part of PATCH
    console.log('Assign lesson', userId, lessonId);
  },

  deleteEmployee: async (userId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/employees?userId=${userId}`, { method: 'DELETE' });
      return res.ok;
    } catch (error) {
      console.error('Error in deleteEmployee:', error);
      return false;
    }
  },

  getProbationEndingSoon: async (limit: number = 5): Promise<(EmployeeProfile & { user: User })[]> => {
    try {
      const allEmployees = await employeeService.getAllEmployees();
      const now = new Date();
      // Filter employees whose probation ends in the future, sorted by proximity to now
      return allEmployees
        .filter(emp => emp.probationEnd && new Date(emp.probationEnd) > now)
        .sort((a, b) => {
          const dateA = a.probationEnd ? new Date(a.probationEnd).getTime() : 0;
          const dateB = b.probationEnd ? new Date(b.probationEnd).getTime() : 0;
          return dateA - dateB;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error in getProbationEndingSoon:', error);
      return [];
    }
  }
};
