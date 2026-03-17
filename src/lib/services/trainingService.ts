import { TrainingPath, UserProgress } from '@/types';
import { storageService } from './storageService';

export const trainingService = {
  delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  async getAllPaths(): Promise<TrainingPath[]> {
    await this.delay(800);
    return storageService.get<TrainingPath>('training_paths');
  },

  async getPathById(id: string): Promise<TrainingPath | null> {
    await this.delay(300);
    return storageService.findOne<TrainingPath>('training_paths', id);
  },

  async createPath(data: Omit<TrainingPath, 'id' | 'createdAt'>): Promise<TrainingPath> {
    await this.delay(500);
    const newPath: TrainingPath = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    return storageService.add<TrainingPath>('training_paths', newPath);
  },

  async updatePath(id: string, updates: Partial<TrainingPath>): Promise<TrainingPath | null> {
    await this.delay(500);
    return storageService.update<TrainingPath>('training_paths', id, updates);
  },

  async deletePath(id: string): Promise<boolean> {
    await this.delay(500);
    return storageService.delete('training_paths', id);
  },

  // User Progress
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    await this.delay(500);
    return storageService.get<UserProgress>(`user_progress_${userId}`);
  },

  async getAllUserProgress(): Promise<UserProgress[]> {
    await this.delay(800);
    // This is a bit tricky with current storageService if we store progress per user. 
    // Let's store all progress in a single 'training_progress' collection.
    return storageService.get<UserProgress>('training_progress');
  },

  async updateTaskProgress(progress: UserProgress): Promise<UserProgress> {
    await this.delay(300);
    const allProgress = storageService.get<UserProgress>('training_progress');
    const index = allProgress.findIndex(p => 
      p.userId === progress.userId && 
      p.pathId === progress.pathId && 
      p.taskId === progress.taskId
    );

    if (index >= 0) {
      allProgress[index] = { ...allProgress[index], ...progress, completedAt: new Date().toISOString() };
      storageService.set('training_progress', allProgress);
      return allProgress[index];
    } else {
      const newProgress = { 
        ...progress, 
        id: `${progress.userId}_${progress.pathId}_${progress.taskId}`, // Consistent ID for progress
        completedAt: new Date().toISOString() 
      };
      allProgress.push(newProgress);
      storageService.set('training_progress', allProgress);
      return newProgress;
    }
  },

  async getAssignedPaths(userId: string): Promise<TrainingPath[]> {
    const paths = await this.getAllPaths();
    return paths.filter(p => p.assignedTo.includes(userId));
  }
};
