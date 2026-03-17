'use client';

import { useEffect } from 'react';
import { storageService } from '@/lib/services/storageService';
import { Candidate, EmployeeProfile, Lesson, User, Vacancy, Test, Interview, ReserveCandidate } from '@/types';

export function DataInitializer() {
  useEffect(() => {
    // Check if data already exists
    const existingUsers = storageService.get<User>('users');
    if (existingUsers.length > 0) return;

    console.log('Initializing Mock Database...');

    // 1. Initial Lessons
    const initialLessons: Lesson[] = [
      {
        id: '1',
        title: { ru: 'Введение в корпоративную культуру', uz: 'Korporativ madaniyatga kirish' },
        description: { ru: 'Основные ценности и правила нашей компании.', uz: 'Kompaniyamizning asosiy qadriyatlari va qoidalari.' },
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        createdAt: new Date().toISOString(),
        authorId: '1'
      },
      {
        id: '2',
        title: { ru: 'Основы безопасности', uz: 'Xavfsizlik asoslari' },
        description: { ru: 'Техника безопасности на рабочем месте.', uz: 'Ish joyidagi xavfsizlik texnikasi.' },
        videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        createdAt: new Date().toISOString(),
        authorId: '1',
        assignmentText: { ru: 'Опишите 3 правила безопасности.', uz: '3 ta xavfsizlik qoidasini tavsiflang.' }
      }
    ];
    storageService.set('lessons', initialLessons);

    // 2. Initial Vacancies
    const initialVacancies: Vacancy[] = [
      {
        id: 'v1',
        title: 'Frontend Developer',
        department: 'Development',
        location: 'Tashkent',
        description: 'We are looking for a React expert.',
        requirements: 'React, TypeScript, Next.js',
        status: 'OPEN',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        candidatesCount: 1,
        createdBy: '1'
      },
      {
        id: 'v2',
        title: 'HR Manager',
        department: 'HR',
        location: 'Tashkent',
        description: 'Experienced HR professional needed.',
        requirements: 'Management, Communication, Recruitment',
        status: 'OPEN',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        candidatesCount: 1,
        createdBy: '1'
      },
      {
        id: 'v3',
        title: 'Python Developer',
        department: 'Development',
        location: 'Remote',
        description: 'Backend wizard wanted.',
        requirements: 'Python, Django, PostgreSQL',
        status: 'OPEN',
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        candidatesCount: 1,
        createdBy: '1'
      }
    ];
    storageService.set('vacancies', initialVacancies);

    // 3. Initial Candidates
    const initialCandidates: Candidate[] = [
      {
        id: 'c1',
        firstName: 'Алишер',
        lastName: 'Усманов',
        email: 'alisher@example.com',
        vacancyId: 'v1',
        vacancyTitle: 'Frontend Developer',
        status: 'INTERVIEW',
        stage: 'Technical Interview',
        appliedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'c2',
        firstName: 'Dilnoza',
        lastName: 'Karimova',
        email: 'dilnoza@example.com',
        vacancyId: 'v2',
        vacancyTitle: 'HR Manager',
        status: 'SCREENING',
        stage: 'Initial Call',
        appliedAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'c3',
        firstName: 'Sardor',
        lastName: 'Raximov',
        email: 'sardor@example.com',
        vacancyId: 'v3',
        vacancyTitle: 'Python Developer',
        status: 'OFFER',
        stage: 'Offer Sent',
        appliedAt: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ];
    storageService.set('candidates', initialCandidates);

    // 4. Initial Interviews
    const initialInterviews: Interview[] = [
      {
        id: 'i1',
        candidateId: 'c1',
        candidateName: 'Алишер Усманов',
        vacancyId: 'v1',
        vacancyTitle: 'Frontend Developer',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        duration: 60,
        type: 'online',
        location: 'https://zoom.us/j/123456789',
        status: 'scheduled',
        createdBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'i2',
        candidateId: 'c2',
        candidateName: 'Dilnoza Karimova',
        vacancyId: 'v2',
        vacancyTitle: 'HR Manager',
        scheduledDate: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        duration: 45,
        type: 'offline',
        location: 'Office Room 302',
        status: 'completed',
        result: 'passed',
        notes: 'Good communication skills, strong background in recruitment.',
        createdBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    storageService.set('interviews', initialInterviews);

    // 5. Initial Reserve Pool
    const initialReserve: ReserveCandidate[] = [
      {
        id: 'r1',
        candidateId: 'c2',
        candidateName: 'Dilnoza Karimova',
        vacancyTitle: 'HR Manager',
        source: 'interview',
        notes: 'Potential senior candidate for next quarter.',
        status: 'active',
        addedBy: '1',
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    storageService.set('reserve_pool', initialReserve);

    // 6. Initial Employee Profiles
    const initialProfiles: EmployeeProfile[] = [
      {
        id: 'p1',
        userId: '2', // John Doe (employee@nexo.com)
        firstName: 'John',
        lastName: 'Doe',
        department: 'Development',
        position: 'Junior Developer',
        joinedAt: '2025-01-15T10:00:00Z',
        probationEnd: '2025-04-15T10:00:00Z',
        learningHistory: [
          { lessonId: '1', completedAt: '2025-02-01T14:30:00Z' }
        ]
      }
    ];
    storageService.set('employee_profiles', initialProfiles);

    // 7. Initial Tests
    const initialTests: any[] = [
      {
        id: 't1',
        title: 'JavaScript Fundamentals',
        description: 'Basic JS knowledge test for web developers.',
        questions: [
          {
            id: 'q1',
            type: 'single',
            question: 'What is closure in JavaScript?',
            options: [
              'A function bundled together with its lexical environment',
              'A way to close a browser tab',
              'A specific type of variable declaration',
              'None of the above'
            ],
            correctAnswers: [0],
            points: 10
          },
          {
            id: 'q2',
            type: 'multiple',
            question: 'Which of the following are JavaScript frameworks/libraries?',
            options: ['React', 'Angular', 'Django', 'Vue', 'Laravel'],
            correctAnswers: [0, 1, 3],
            points: 20
          },
          {
            id: 'q3',
            type: 'text',
            question: 'What command is used to install packages via npm?',
            correctAnswers: [], // Text answers are manual or keyword based
            points: 15
          }
        ],
        timeLimit: 15,
        attemptsAllowed: 3,
        passingScore: 70,
        shuffleQuestions: true,
        shuffleOptions: true,
        showResultImmediately: true,
        status: 'active',
        category: 'Development',
        createdBy: '1',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      }
    ];
    storageService.set('tests', initialTests);
    storageService.set('test_results', []);

    // 11. Initial Training Paths
    const initialPaths: any[] = [
      {
        id: 'tp1',
        title: 'Middle React Developer Plan',
        description: 'Master advanced React patterns, hooks, and performance optimization.',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop',
        stages: [
          {
            id: 'stage1',
            title: 'Advanced Hooks',
            description: 'Deep dive into useMemo, useCallback, and custom hooks.',
            order: 1,
            estimatedHours: 5,
            tasks: [
              {
                id: 'task1',
                title: 'Understanding useMemo',
                description: 'Detailed explanation of memoization in React.',
                type: 'video',
                content: 'https://www.youtube.com/watch?v=pJzeatwAnCc',
                required: true,
                estimatedMinutes: 25
              },
              {
                id: 'task2',
                title: 'Hooks Challenge',
                description: 'Implement a custom hook for window resize.',
                type: 'assignment',
                content: 'Create a useWindowSize hook that returns the width and height of the window.',
                required: true,
                estimatedMinutes: 45
              }
            ]
          },
          {
            id: 'stage2',
            title: 'State Management',
            description: 'Comparing Context API, Redux Toolkit, and Zustand.',
            order: 2,
            estimatedHours: 8,
            tasks: [
              {
                id: 'task3',
                title: 'Zustand Basics',
                description: 'Introduction to simple state management with Zustand.',
                type: 'article',
                content: 'Zustand is a small, fast and scalable bearbones state-management solution...',
                required: true,
                estimatedMinutes: 15
              },
              {
                id: 'task4',
                title: 'State Management Quiz',
                description: 'Final quiz for the state management module.',
                type: 'quiz',
                content: 't1',
                required: true,
                estimatedMinutes: 20
              }
            ]
          }
        ],
        assignedTo: ['2'],
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        createdBy: '1'
      }
    ];
    storageService.set('training_paths', initialPaths);
    storageService.set('training_progress', []);

    // 8. Initial Assignments
    storageService.set('assignments', []);

    // 9. Initial Applications
    storageService.set('applications', []);
    
    // 10. Initial Users
    const initialUsers: User[] = [
      {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@nexo.com',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        settings: {
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
        }
      },
      {
        id: '2',
        firstName: 'John',
        lastName: 'Doe',
        email: 'employee@nexo.com',
        role: 'EMPLOYEE',
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        settings: {
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
        }
      }
    ];
    // 10. Initial System Settings
    const initialSystemSettings = {
      companyName: 'Nexo HR',
      defaultLanguage: 'uz',
      timezone: 'Asia/Tashkent',
      interviewDuration: 45,
      autoCalculateScore: true,
    };
    localStorage.setItem('system_settings', JSON.stringify(initialSystemSettings));

  }, []);

  return null;
}
