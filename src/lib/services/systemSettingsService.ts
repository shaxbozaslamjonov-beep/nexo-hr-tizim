import { SystemSettings } from '@/types';

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  companyName: 'Nexo HR',
  defaultLanguage: 'uz',
  timezone: 'Asia/Tashkent',
  interviewDuration: 45,
  autoCalculateScore: true,
};

export const systemSettingsService = {
  getSettings: (): SystemSettings => {
    const settings = localStorage.getItem('system_settings');
    return settings ? JSON.parse(settings) : DEFAULT_SYSTEM_SETTINGS;
  },

  updateSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const currentSettings = systemSettingsService.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem('system_settings', JSON.stringify(updatedSettings));
    return updatedSettings;
  },

  getDefaultSettings: (): SystemSettings => DEFAULT_SYSTEM_SETTINGS,
};
