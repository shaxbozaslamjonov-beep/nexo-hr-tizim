'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { applicationService } from '@/lib/services/applicationService';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Application } from '@/types';
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Inbox
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLanguage();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const data = await applicationService.getApplicationById(id);
        if (data) {
          setApp(data);
        }
      } catch (error) {
        console.error('Failed to fetch application:', error);
        toast.error('Failed to load application');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const handleStatusChange = async (newStatus: Application['status']) => {
    if (app) {
      try {
        const updated = await applicationService.updateApplication(id, { status: newStatus });
        if (updated) {
          setApp(updated);
          toast.success(`Status updated to ${newStatus}`);
        }
      } catch (error) {
        console.error('Failed to update status:', error);
        toast.error('Failed to update status');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>{t('loading')}</div>;
  if (!app) return <div style={{ padding: '2rem' }}>Application not found</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Link
        href="/dashboard/hr/applications"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--text-secondary)', 
          marginBottom: '2rem',
          fontWeight: 600
        }}
        className="hover-lift"
      >
        <ArrowLeft size={20} />
        {t('applications.viewAll')}
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={detailCardStyle}
          >
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={largeAvatarStyle}>
                {app.firstName[0]}{app.lastName[0]}
              </div>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                  {app.firstName} {app.lastName}
                </h1>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span style={metaDetailStyle}><Mail size={16} /> {app.email}</span>
                  <span style={metaDetailStyle}><Phone size={16} /> {app.phone}</span>
                  <span style={metaDetailStyle}><Calendar size={16} /> {app.dateOfBirth || 'N/A'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info Sections */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={detailCardStyle}>
              <h3 style={sectionTitleStyle}><Briefcase size={20} /> {t('applications.form.step2')}</h3>
              <div style={infoGridStyle}>
                <div>
                  <p style={infoLabelStyle}>{t('applications.form.educationLevel')}</p>
                  <p style={infoValueStyle}>{app.educationLevel}</p>
                </div>
                <div>
                  <p style={infoLabelStyle}>{t('applications.form.totalExperience')}</p>
                  <p style={infoValueStyle}>{app.totalExperienceMonths} months</p>
                </div>
                <div>
                  <p style={infoLabelStyle}>{t('applications.form.computerSkills')}</p>
                  <p style={infoValueStyle}>{app.computerSkills}</p>
                </div>
                <div>
                  <p style={infoLabelStyle}>{t('applications.form.shiftWork')}</p>
                  <p style={infoValueStyle}>{app.availableForShifts ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={detailCardStyle}>
              <h3 style={sectionTitleStyle}><FileText size={20} /> {t('applications.form.step3')}</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {Object.entries(app.documents).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: val ? 'var(--success)' : 'var(--text-light)' }}>
                    {val ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t(`applications.form.${key === 'medicalClearance' ? 'medical' : key === 'workRecord' ? 'workBook' : key}`)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Address / Source */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={detailCardStyle}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={sectionTitleStyle}><MapPin size={20} /> {t('applications.form.address')}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{app.address || 'No address provided'}</p>
                </div>
                <div>
                  <h3 style={sectionTitleStyle}><Inbox size={20} /> {t('applications.source')}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{app.source}</p>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Sidebar / Actions */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={detailCardStyle}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--grad-primary)', color: 'white', marginBottom: '1rem', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}>
                <Award size={40} />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{app.score || 0}</h2>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>{t('applications.score')}</p>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
               <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem' }}>{t('statusLabel')}</p>
               <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {(['new', 'reviewing', 'interview', 'accepted', 'rejected'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        background: app.status === s ? 'var(--primary)' : 'white',
                        color: app.status === s ? 'white' : 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                    >
                      {t(`applications.status.${s}`)}
                    </button>
                  ))}
               </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ ...detailCardStyle, background: 'var(--background)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Application Info</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Applied Date</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(app.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Last Update</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(app.updatedAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Vacancy ID</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>#{app.vacancyId}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const detailCardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  borderRadius: '24px',
  padding: '2rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  border: '1px solid var(--border)'
};

const largeAvatarStyle: React.CSSProperties = {
  width: '100px',
  height: '100px',
  borderRadius: '24px',
  background: 'var(--grad-sidebar)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2.5rem',
  fontWeight: 900,
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
};

const metaDetailStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: 'var(--text-secondary)',
  fontSize: '0.95rem',
  fontWeight: 600
};

const sectionTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  fontSize: '1.1rem',
  fontWeight: 800,
  marginBottom: '1.5rem',
  color: 'var(--text-primary)'
};

const infoGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1.5rem'
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-light)',
  textTransform: 'uppercase',
  fontWeight: 700,
  marginBottom: '0.25rem'
};

const infoValueStyle: React.CSSProperties = {
  fontWeight: 700,
  color: 'var(--text-primary)',
  fontSize: '1rem'
};
