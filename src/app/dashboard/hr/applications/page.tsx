'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, 
  Search, 
  Filter, 
  ExternalLink, 
  Eye, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { applicationService } from '@/lib/services/applicationService';
import { Application } from '@/types';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ApplicationsPage() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getApplications();
      setApplications(data);
      applyFilters(data, activeFilter, searchQuery);
    } catch (error) {
      toast.error('Error loading applications');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: Application[], filter: string, search: string) => {
    let result = [...data];
    if (filter !== 'all') {
      result = result.filter(a => a.status === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.firstName.toLowerCase().includes(q) || 
        a.lastName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    }
    setFilteredApps(result);
  };

  const handleFilter = (status: string) => {
    setActiveFilter(status);
    applyFilters(applications, status, searchQuery);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    applyFilters(applications, activeFilter, q);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await applicationService.deleteApplication(id);
        await loadApplications();
      } catch (error) {
        toast.error('Failed to delete application');
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {t('applications.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Track and manage all incoming job applications
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="text" 
              placeholder={t('searchByName')}
              value={searchQuery}
              onChange={handleSearch}
              style={searchInputStyle}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['all', 'new', 'reviewing', 'interview', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => handleFilter(status)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              background: activeFilter === status ? 'var(--primary)' : 'white',
              color: activeFilter === status ? 'white' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeFilter === status ? '0 4px 12px rgba(99, 102, 241, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
          >
            {status === 'all' ? t('all') : t(`applications.status.${status}`)}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>{t('loading')}</div>
        ) : filteredApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--surface)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
            <Inbox size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h3 style={{ color: 'var(--text-secondary)' }}>No applications found</h3>
          </div>
        ) : (
          <AnimatePresence>
            {filteredApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={cardStyle}
                className="hover-lift"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                  <div style={avatarStyle}>
                    {app.firstName[0]}{app.lastName[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {app.firstName} {app.lastName}
                      </h3>
                      <span className={`badge badge-${app.status === 'new' ? 'pending' : app.status === 'accepted' ? 'passed' : app.status === 'rejected' ? 'failed' : 'training'}`}>
                        {t(`applications.status.${app.status}`)}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                      {app.vacancyTitle || 'General Position'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.25rem' }}>
                      <Award size={16} />
                      {app.score || 0} pts
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 500 }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/dashboard/hr/applications/${app.id}`}>
                      <button style={actionButtonStyle} title="View Details">
                        <Eye size={20} />
                      </button>
                    </Link>
                    <button onClick={() => handleDelete(app.id)} style={{ ...actionButtonStyle, color: '#ef4444' }} title="Delete">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

const searchInputStyle: React.CSSProperties = {
  padding: '0.75rem 1rem 0.75rem 2.75rem',
  borderRadius: '14px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  fontSize: '0.9rem',
  fontWeight: 500,
  minWidth: '300px',
  outline: 'none',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  borderRadius: '20px',
  padding: '1.25rem 1.5rem',
  border: '1px solid var(--border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'all 0.2s',
};

const avatarStyle: React.CSSProperties = {
  width: '52px',
  height: '52px',
  borderRadius: '16px',
  background: 'var(--grad-sidebar)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
  fontWeight: 800,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
};

const actionButtonStyle: React.CSSProperties = {
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s'
};
