'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface VacancyLite {
  id: string;
  title: string;
  department: string;
}

interface ApplicationLite {
  id: string;
  stage: string;
  screeningScore: number | null;
  interviewScore: number | null;
  examScore: number | null;
  finalScore: number | null;
  trainingCompleted: boolean;
  vacancy: VacancyLite;
}

interface InterviewLite {
  id: string;
  scheduledAt: string;
  result: string | null;
  totalScore: number | null;
}

interface TrainingAssignmentLite {
  id: string;
  status: string;
  score: number | null;
  module: { title: string };
}

interface TestResultLite {
  id: string;
  status: string;
  score: number;
  test: { title: string };
}

interface ProfileLite {
  firstName: string;
  lastName: string;
  status: string;
  score: number;
  applications: ApplicationLite[];
  interviews: InterviewLite[];
  trainingAssignments: TrainingAssignmentLite[];
  testResults: TestResultLite[];
}

const STAGE_LABELS: Record<string, string> = {
  APPLIED: 'Заявка подана',
  MINI_INTERVIEW: 'Приглашены на мини-интервью',
  SCREENING_PASSED: 'Скрининг пройден',
  RESERVE_POOL: 'В кадровом резерве',
  INTERVIEW_SCHEDULED: 'Собеседование назначено',
  REJECTED: 'Отклонена',
};

function formatStage(stage: string) {
  return STAGE_LABELS[stage] || stage;
}

function trainingUnlocked(profile: ProfileLite) {
  return profile.interviews.some((iv) => iv.result?.toUpperCase() === 'PASSED')
    || profile.trainingAssignments.length > 0;
}

export function CandidateDashboardContent({ profile }: { profile: ProfileLite | null }) {
  const { t } = useLanguage();

  if (!profile) {
    return (
      <div style={{ padding: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{t('candidateDashboard.title')}</h1>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {t('candidateDashboard.noApplications')}
          <div style={{ marginTop: '1rem' }}>
            <Link href="/" className="text-primary" style={{ fontWeight: 600 }}>
              {t('candidateDashboard.applyMore')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
        {t('candidateDashboard.title')}
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        {profile.firstName} {profile.lastName}
      </p>

      {profile.applications.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {t('candidateDashboard.noApplications')}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {profile.applications.map((app) => (
            <div key={app.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{app.vacancy.title}</div>
                <span className={`badge badge-${app.stage.toLowerCase()}`}>{formatStage(app.stage)}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{app.vacancy.department}</div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {app.screeningScore != null && <span>Screening: {app.screeningScore}</span>}
                {app.interviewScore != null && <span>Interview: {app.interviewScore}</span>}
                {app.examScore != null && <span>Exam: {app.examScore}</span>}
                {app.trainingCompleted && <span>✅ Training completed</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>{t('candidateDashboard.interviews')}</h2>
      {profile.interviews.length === 0 ? (
        <div style={{ color: 'var(--text-light)' }}>{t('candidateDashboard.noInterviews')}</div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {profile.interviews.map((iv) => (
            <div key={iv.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{t('candidateDashboard.scheduledAt')}: {new Date(iv.scheduledAt).toLocaleString()}</span>
              {iv.totalScore != null && <span>{t('candidateDashboard.score')}: {iv.totalScore}</span>}
              {iv.result && <span className={`badge badge-${iv.result.toLowerCase()}`}>{iv.result}</span>}
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '2rem 0 1rem' }}>{t('candidateDashboard.training')}</h2>
      {trainingUnlocked(profile) ? (
        profile.trainingAssignments.length === 0 && profile.testResults.length === 0 ? (
          <div style={{ color: 'var(--text-light)' }}>{t('candidateDashboard.trainingUnlockedEmpty')}</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {profile.trainingAssignments.map((ta) => (
              <div key={ta.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{ta.module.title}</span>
                <span className={`badge badge-${ta.status.toLowerCase()}`}>{ta.status}</span>
              </div>
            ))}
            {profile.testResults.map((tr) => (
              <div key={tr.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{tr.test.title}</span>
                <span>{tr.score} — <span className={`badge badge-${tr.status.toLowerCase()}`}>{tr.status}</span></span>
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{ background: 'var(--bg-muted)', border: '1px dashed var(--border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          🔒 {t('candidateDashboard.trainingLocked')}
        </div>
      )}
    </div>
  );
}
