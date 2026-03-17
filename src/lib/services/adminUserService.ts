import { User, UserRole } from '@/types';
import { storageService } from './storageService';
import { userSettingsService } from './userSettingsService';

export const adminUserService = {
  getUsers: (): User[] => {
    return storageService.get<User>('users');
  },

  getUserById: (id: string): User | null => {
    return storageService.findOne<User>('users', id);
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      role: userData.role || 'EMPLOYEE',
      isActive: true,
      createdAt: new Date().toISOString(),
      settings: userSettingsService.getDefaultSettings(),
      ...userData
    };
    
    return storageService.add<User>('users', newUser);
  },

  updateUser: (id: string, updates: Partial<User>): User | null => {
    return storageService.update<User>('users', id, updates);
  },

  deleteUser: (id: string): boolean => {
    return storageService.delete('users', id);
  },

  toggleUserStatus: (id: string): User | null => {
    const user = adminUserService.getUserById(id);
    if (!user) return null;
    return adminUserService.updateUser(id, { isActive: !user.isActive });
  }
};
