import { Application, Vacancy, Candidate } from '@/types';
import { storageService } from './storageService';
import { vacancyService } from './vacancyService';
import { candidateService } from './candidateService';

const STORAGE_KEY = 'applications';

export const applicationService = {
  getApplications: async (): Promise<Application[]> => {
    const res = await fetch('/api/candidates'); // Currently candidates returns applications too
    if (!res.ok) throw new Error('Failed to fetch applications');
    const candidates = await res.json();
    // Move all applications into a flat list
    return candidates.flatMap((c: any) => c.applications.map((app: any) => ({
      ...app,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      vacancyTitle: app.vacancy?.title || 'Unknown',
    })));
  },

  getApplicationById: async (id: string): Promise<Application | null> => {
    const res = await fetch(`/api/candidates`); // Temporary hack if no direct app route
    const apps = await applicationService.getApplications();
    return apps.find(a => a.id === id) || null;
  },

  createApplication: async (data: any): Promise<Application> => {
    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create application');
    return res.json();
  },

  updateApplication: async (id: string, updates: Partial<Application>): Promise<Application | null> => {
    // This might require a dedicated application update endpoint
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update application');
    return res.json();
  },

  deleteApplication: async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  getApplicationsByVacancy: async (vacancyId: string): Promise<Application[]> => {
    const all = await applicationService.getApplications();
    return all.filter(app => app.vacancyId === vacancyId);
  }
};

function calculateScore(data: Partial<Application>): number {
  let score = 0;
  // Education
  if (data.educationLevel === "bachelor") score += 30;
  else if (data.educationLevel === "master") score += 40;
  else if (data.educationLevel === "phd") score += 50;
  else score += 10;

  // Experience
  if (data.totalExperienceMonths) {
    if (data.totalExperienceMonths >= 24) score += 30;
    else if (data.totalExperienceMonths >= 12) score += 20;
    else score += 10;
  }

  // Computer Skills
  if (data.computerSkills === "basic") score += 10;
  else if (data.computerSkills === "intermediate") score += 20;
  else if (data.computerSkills === "advanced") score += 30;

  // Manufacturing Experience
  if (data.manufacturingExperience) score += 15;

  return score;
}

async function integrateWithCandidate(app: Application) {
  const candidates = storageService.get<Candidate>('candidates');
  let candidate = candidates.find(c => c.email.toLowerCase() === app.email.toLowerCase());

  if (candidate) {
    // Update existing candidate
    const applicationIds = candidate.applicationIds || [];
    if (!applicationIds.includes(app.id)) {
      applicationIds.push(app.id);
    }
    await candidateService.updateCandidate(candidate.id, {
      applicationIds,
      score: app.score, // keep the latest score or handle as needed
      vacancyId: app.vacancyId,
      vacancyTitle: app.vacancyTitle || candidate.vacancyTitle,
      status: 'SCREENING' // Reset to screening if they apply again? 
    });
  } else {
    // Create new candidate
    await candidateService.createCandidate({
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      phone: app.phone,
      vacancyId: app.vacancyId,
      vacancyTitle: app.vacancyTitle || 'Unknown Vacancy',
    });
    
    // Refresh to get the created candidate and add the application ID
    const updatedCandidates = storageService.get<Candidate>('candidates');
    const newCand = updatedCandidates.find(c => c.email.toLowerCase() === app.email.toLowerCase());
    if (newCand) {
      await candidateService.updateCandidate(newCand.id, {
        applicationIds: [app.id],
        score: app.score
      });
    }
  }
}
