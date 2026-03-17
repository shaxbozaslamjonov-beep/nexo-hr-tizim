import { User, UserSettings } from '@/types';
import { storageService } from './storageService';

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
  theme: 'light',
};

export const userSettingsService = {
  getSettings: (userId: string): UserSettings => {
    const user = storageService.findOne<User>('users', userId);
    return user?.settings || DEFAULT_SETTINGS;
  },

  updateSettings: async (userId: string, settings: Partial<UserSettings>): Promise<UserSettings> => {
    const user = storageService.findOne<User>('users', userId);
    if (!user) throw new Error('User not found');

    const updatedSettings = { ...user.settings, ...settings };
    storageService.update<User>('users', userId, { settings: updatedSettings });
    
    // Also update auth_user in localStorage if it's the current user
    const authUserStr = localStorage.getItem('auth_user');
    if (authUserStr) {
      const authUser = JSON.parse(authUserStr) as User;
      if (authUser.id === userId) {
        localStorage.setItem('auth_user', JSON.stringify({ ...authUser, settings: updatedSettings }));
      }
    }

    return updatedSettings;
  },

  changePassword: async (userId: string, oldPassword: string, newPassword: string): Promise<boolean> => {
    // Mock password change logic
    console.log(`Password changed for user ${userId}`);
    return true;
  },

  getDefaultSettings: (): UserSettings => DEFAULT_SETTINGS,
};
