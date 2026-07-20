'use client';

import { useState, useEffect } from 'react';
import styles from '../vacancies/vacancies.module.css';

interface Reserve {
  id: string;
  targetRole: string;
  branch: string;
  readiness: number;
  addedAt: string;
  candidate: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
}

export function ReserveContent() {
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reserve')
      .then(res => res.json())
      .then(data => {
        setReserves(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Talent Reserve Pool</h1>
          <p className={styles.pageSubtitle}>Pre-qualified candidates ready for deployment</p>
        </div>
      </div>

      {loading ? (
        <p>Loading reserve pool…</p>
      ) : reserves.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          No candidates in the reserve pool. Candidates are added here automatically after passing screening but before hiring.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {reserves.map((r) => (
            <div key={r.id} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700 }}>{r.candidate?.firstName || 'Unknown'} {r.candidate?.lastName || 'Candidate'}</h3>
                <span style={{ 
                  padding: '0.125rem 0.625rem', 
                  borderRadius: '9999px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--primary)'
                }}>
                  {r.targetRole}
                </span>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Readiness Level</p>
                <div style={{ height: '8px', background: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${r.readiness}%`, height: '100%', background: 'var(--success)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>Learning Progress</span>
                  <span>{r.readiness}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} style={{ flex: 1 }}>Hire Now</button>
                <button className={styles.actionBtn} style={{ flex: 1 }}>Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
