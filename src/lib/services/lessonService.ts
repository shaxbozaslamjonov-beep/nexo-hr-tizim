import { Lesson, Assignment } from '@/types';

// Real service for lessons and assignments using API
export const lessonService = {
  async getLessons(): Promise<Lesson[]> {
    const res = await fetch('/api/lessons');
    if (!res.ok) throw new Error('Failed to fetch lessons');
    return res.json();
  },

  async getLessonById(id: string): Promise<Lesson | null> {
    const res = await fetch(`/api/lessons/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch lesson');
    return res.json();
  },

  async getAssignments(): Promise<Assignment[]> {
    const res = await fetch('/api/lessons/assignments');
    if (!res.ok) throw new Error('Failed to fetch assignments');
    return res.json();
  },

  async createLesson(lessonData: Omit<Lesson, 'id' | 'createdAt'>): Promise<Lesson> {
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData)
    });
    if (!res.ok) throw new Error('Failed to create lesson');
    return res.json();
  },

  async submitAssignment(lessonId: string, userId: string, submissionText: string): Promise<Assignment> {
    const res = await fetch('/api/lessons/assignments', {
      method: 'POST', // Or PATCH if we check for existing first in the API
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, employeeId: userId, submissionText, status: 'SUBMITTED' })
    });
    if (!res.ok) throw new Error('Failed to submit assignment');
    return res.json();
  },

  async getAssignmentsByUser(userId: string): Promise<Assignment[]> {
    const res = await fetch(`/api/lessons/assignments?employeeId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user assignments');
    return res.json();
  },

  async gradeAssignment(assignmentId: string, grade: number): Promise<Assignment | null> {
    const res = await fetch(`/api/lessons/assignments/${assignmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: grade, status: 'CHECKED' })
    });
    if (!res.ok) throw new Error('Failed to grade assignment');
    return res.json();
  },

  async updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<Lesson | null> {
    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update lesson');
    return res.json();
  },

  async deleteLesson(id: string): Promise<boolean> {
    const res = await fetch(`/api/lessons/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  }
};
