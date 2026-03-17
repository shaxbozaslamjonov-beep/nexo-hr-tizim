
export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'HR_MANAGER' | 'DIRECTOR' | 'DEPARTMENT_HEAD';

export interface UserSettings {
  language: 'uz' | 'ru';
  dateFormat: 'dd.mm.yyyy' | 'yyyy-mm-dd' | 'mm/dd/yyyy';
  timeFormat: '24h' | '12h';
  notifications: {
    email: boolean;
    push: boolean;
    interviewReminders: boolean;
    newApplications: boolean;
    assignmentGraded: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

export interface SystemSettings {
  companyName: string;
  companyLogo?: string;
  defaultLanguage: 'uz' | 'ru';
  timezone: string;
  interviewDuration: number;
  autoCalculateScore: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  settings: UserSettings;
}

export interface Lesson {
  id: string;
  title: Record<string, string>; // { ru: '...', uz: '...' }
  description: Record<string, string>;
  videoUrl?: string;
  fileAttachment?: {
    name: string;
    url: string;
  };
  assignmentText?: Record<string, string>;
  createdAt: string;
  authorId: string;
}

export interface Assignment {
  id: string;
  lessonId: string;
  userId: string;
  submissionText?: string;
  fileUrl?: string;
  status: 'PENDING' | 'SUBMITTED' | 'CHECKED';
  grade?: number;
  submittedAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName?: string;
  vacancyId?: string;
  vacancyTitle?: string;
  scheduledDate: string; // ISO format
  duration: number; // in minutes
  type: 'online' | 'offline' | 'phone';
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  result?: 'passed' | 'failed' | 'pending';
  notes?: string;
  feedback?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReserveCandidate {
  id: string;
  candidateId: string;
  candidateName?: string;
  vacancyTitle?: string;
  source: 'interview' | 'application' | 'manual';
  notes?: string;
  status: 'active' | 'hired' | 'removed';
  addedBy: string;
  addedAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  vacancyId: string;
  vacancyTitle?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  source: string; // "Company Website", "LinkedIn", etc.
  educationLevel: string;
  totalExperienceMonths: number;
  computerSkills: string;
  availableForShifts: boolean;
  manufacturingExperience: boolean;
  documents: {
    passport: boolean;
    diploma: boolean;
    medicalClearance: boolean;
    workRecord: boolean;
  };
  status: 'new' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  score?: number;
  screeningScore?: number;
  interviewScore?: number;
  examScore?: number;
  finalScore?: number;
  trainingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  vacancyId?: string;
  vacancyTitle: string;
  status: 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'HIRED';
  photoUrl?: string;
  stage: string;
  appliedAt: string;
  experience?: string;
  education?: string;
  region?: string;
  score?: number;
  applicationIds?: string[];
}

export interface Vacancy {
  id: string;
  title: string;
  department: string;
  location?: string;
  description: string;
  requirements: string;
  salary?: string;
  salaryRange?: string;
  salaryMin?: number;
  salaryMax?: number;
  shift?: string;
  status: 'OPEN' | 'PENDING' | 'CLOSED' | 'PENDING_APPROVAL';
  candidatesCount: number;
  createdAt: string;
  createdBy: string;
  positionId?: string | null;
  positionRef?: { id: string, title: string };
}

export type VacancyStatus = 'OPEN' | 'PENDING' | 'CLOSED';

export interface TestQuestion {
  id: string;
  type: 'single' | 'multiple' | 'text';
  question: string;
  options?: string[]; // only for single/multiple
  correctAnswers?: number[]; // indices of correct options
  points: number;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  questions: TestQuestion[];
  timeLimit: number; // in minutes, 0 = no limit
  attemptsAllowed: number; // 0 = unlimited
  passingScore: number; // percentage (0-100)
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultImmediately: boolean;
  status: 'active' | 'draft' | 'archived';
  category: string;
  createdBy: string;
  createdAt: string;
}

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  score: number; // percentage (0-100)
  status: 'passed' | 'failed';
  answers: any[]; // User's selected answers
  completedAt: string;
  attemptNumber: number;
}

export interface TrainingTask {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  content?: string; // video URL, text, test ID or assignment description
  required: boolean;
  estimatedMinutes: number;
}

export interface TrainingStage {
  id: string;
  title: string;
  description: string;
  order: number;
  tasks: TrainingTask[];
  estimatedHours: number;
}

export interface TrainingPath {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  stages: TrainingStage[];
  assignedTo: string[]; // User IDs
  createdAt: string;
  createdBy: string;
  status: 'active' | 'archived';
}

export interface UserProgress {
  id: string;
  userId: string;
  pathId: string;
  stageId: string;
  taskId: string;
  completed: boolean;
  completedAt?: string;
  score?: number; // For quiz tasks
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  joinedAt: string;
  probationEnd?: string;
  photoUrl?: string; // Added for visual consistency
  assignedLessons?: string[];
  learningHistory: {
    lessonId: string;
    completedAt: string;
    score?: number;
  }[];
  positionId?: string | null;
  positionRef?: { id: string, title: string };
}
