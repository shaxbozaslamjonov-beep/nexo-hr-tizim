import { Test, TestResult, TestQuestion } from '@/types';
import { storageService } from './storageService';

export const testService = {
  delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  async getAllTests(): Promise<Test[]> {
    await this.delay(800);
    return storageService.get<Test>('tests');
  },

  async getTestById(id: string): Promise<Test | null> {
    await this.delay(300);
    return storageService.findOne<Test>('tests', id);
  },

  async createTest(data: Omit<Test, 'id' | 'createdAt'>): Promise<Test> {
    await this.delay(500);
    const newTest: Test = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    return storageService.add<Test>('tests', newTest);
  },

  async updateTest(id: string, updates: Partial<Test>): Promise<Test | null> {
    await this.delay(500);
    return storageService.update<Test>('tests', id, updates);
  },

  async deleteTest(id: string): Promise<boolean> {
    await this.delay(500);
    return storageService.delete('tests', id);
  },

  async submitTestResult(data: Omit<TestResult, 'id' | 'completedAt' | 'status'>): Promise<TestResult> {
    await this.delay(500);
    
    // Calculate pass/fail
    const test = await this.getTestById(data.testId);
    let status: 'passed' | 'failed' = 'failed';
    if (test) {
      status = data.score >= test.passingScore ? 'passed' : 'failed';
    }

    const newResult: TestResult = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      status,
      completedAt: new Date().toISOString(),
    };
    return storageService.add<TestResult>('test_results', newResult);
  },

  async getAllTestResults(): Promise<TestResult[]> {
    await this.delay(800);
    return storageService.get<TestResult>('test_results');
  },

  async getUserTestResults(userId: string): Promise<TestResult[]> {
    await this.delay(500);
    return storageService.findWhere<TestResult>('test_results', r => r.userId === userId);
  },

  async getTestResultsByTest(testId: string): Promise<TestResult[]> {
    await this.delay(500);
    return storageService.findWhere<TestResult>('test_results', r => r.testId === testId);
  },

  async importQuestions(testId: string, questions: TestQuestion[]): Promise<Test | null> {
    await this.delay(800);
    const test = await this.getTestById(testId);
    if (!test) return null;
    
    const updatedTest = {
      ...test,
      questions: [...test.questions, ...questions]
    };
    return storageService.update<Test>('tests', testId, updatedTest);
  }
};
