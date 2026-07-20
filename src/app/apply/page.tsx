'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from './apply.module.css';

function ApplyForm() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const vacancyId = searchParams.get('vacancy') || '';

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    education: '',
    experienceMonths: '',
    shiftReady: false,
    hasManufacturingExp: false,
    computerSkill: 'basic',
    hasRequiredDocs: false,
    source: 'website',
  });

  const STEPS = [
    t('apply.steps.personal'),
    t('apply.steps.experience'),
    t('apply.steps.documents'),
    t('apply.steps.confirm')
  ];

  const update = (field: string, val: any) => setForm((f) => ({ ...f, [field]: val }));

  const next = () => {
    setError('');
    if (step === 0 && (!form.firstName || !form.lastName || !form.email)) {
      setError(t('apply.errors.requiredFields'));
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!vacancyId) {
      setError(t('apply.errors.noVacancy'));
      return;
    }
    if (!form.hasRequiredDocs) {
      setError(t('apply.errors.docsRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, vacancyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  if (result) {
    const statusLabel = t(`apply.success.status.${result.screening?.status}`) || result.screening?.status;
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.page}
      >
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>H</div>
            <span className={styles.logoText}>Nexo HR</span>
          </div>
        </div>
        <div className={styles.formCard}>
          <div className={styles.success}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>{t('apply.success.title')}</h2>
            <p className={styles.successText}>{t('apply.success.text')}</p>
            <div className={styles.scoreCard}>
              <div className={styles.scoreTitle}>{t('apply.success.score')}</div>
              <div className={styles.scoreValue}>{result.screening?.totalScore} / 100</div>
              <div className={styles.scoreStatus}>{statusLabel}</div>
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t('apply.success.nextStep')}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>H</div>
          <span className={styles.logoText}>Nexo HR</span>
        </div>
        <h1 className={styles.title}>{t('apply.title')}</h1>
        <p className={styles.subtitle}>{t('apply.subtitle')}</p>
      </header>

      <main className={styles.formCard}>
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.steps}>
          {STEPS.map((label, i) => (
            <div key={i} className={`${styles.step} ${i === step ? styles.active : ''}`}>
              <div className={`${styles.stepNum} ${i < step ? styles.done : i === step ? styles.active : ''}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={styles.stepLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.formBody}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error && <div className={styles.error}>{error}</div>}

              {/* STEP 0 – Personal Info */}
              {step === 0 && (
                <>
                  <div className={styles.sectionTitle}>👤 {t('apply.steps.personal')}</div>
                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('apply.fields.firstName')} <span className={styles.required}>*</span></label>
                      <input className={styles.input} value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Alisher" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('apply.fields.lastName')} <span className={styles.required}>*</span></label>
                      <input className={styles.input} value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Karimov" />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('apply.fields.email')} <span className={styles.required}>*</span></label>
                    <input className={styles.input} type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="a.karimov@email.com" />
                  </div>
                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('apply.fields.phone')}</label>
                      <input className={styles.input} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+998 90 123 4567" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('apply.fields.birthDate')}</label>
                      <input className={styles.input} type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('apply.fields.address')}</label>
                    <input className={styles.input} value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="City, District" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('apply.fields.source')}</label>
                    <select className={styles.select} value={form.source} onChange={(e) => update('source', e.target.value)}>
                      <option value="website">{t('apply.sources.website')}</option>
                      <option value="telegram">{t('apply.sources.telegram')}</option>
                      <option value="referral">{t('apply.sources.referral')}</option>
                      <option value="jobportal">{t('apply.sources.jobportal')}</option>
                      <option value="other">{t('apply.sources.other')}</option>
                    </select>
                  </div>
                </>
              )}

              {/* STEP 1 – Experience */}
              {step === 1 && (
                <>
                  <div className={styles.sectionTitle}>💼 {t('apply.steps.experience')}</div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('apply.fields.education')}</label>
                    <select className={styles.select} value={form.education} onChange={(e) => update('education', e.target.value)}>
                      <option value="">{t('all')}…</option>
                      <option value="secondary">{t('apply.education.secondary')}</option>
                      <option value="college">{t('apply.education.college')}</option>
                      <option value="bachelor">{t('apply.education.bachelor')}</option>
                      <option value="master">{t('apply.education.master')}</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('apply.fields.experienceMonths')}</label>
                    <input className={styles.input} type="number" min="0" value={form.experienceMonths} onChange={(e) => update('experienceMonths', e.target.value)} placeholder="e.g. 24 (= 2 years)" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('apply.fields.computerSkill')}</label>
                    <select className={styles.select} value={form.computerSkill} onChange={(e) => update('computerSkill', e.target.value)}>
                      <option value="none">{t('apply.computerSkills.none')}</option>
                      <option value="basic">{t('apply.computerSkills.basic')}</option>
                      <option value="advanced">{t('apply.computerSkills.advanced')}</option>
                    </select>
                  </div>
                  <div className={styles.checkRow}>
                    <input type="checkbox" id="shiftReady" checked={form.shiftReady} onChange={(e) => update('shiftReady', e.target.checked)} />
                    <label htmlFor="shiftReady" className={styles.checkLabel}>
                      {t('apply.fields.shiftReady')}
                    </label>
                  </div>
                  <div className={styles.checkRow}>
                    <input type="checkbox" id="mfgExp" checked={form.hasManufacturingExp} onChange={(e) => update('hasManufacturingExp', e.target.checked)} />
                    <label htmlFor="mfgExp" className={styles.checkLabel}>
                      {t('apply.fields.manufacturingExp')}
                    </label>
                  </div>
                </>
              )}

              {/* STEP 2 – Documents */}
              {step === 2 && (
                <>
                  <div className={styles.sectionTitle}>📄 {t('apply.steps.documents')}</div>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    Please confirm that you have the following documents ready to present on request:
                  </p>
                  {['Passport / National ID', 'Diploma or Certificate', 'Medical Clearance', 'Work Record Book'].map((doc) => (
                    <div key={doc} className={styles.checkRow}>
                      <input type="checkbox" checked readOnly />
                      <span className={styles.checkLabel}>{doc}</span>
                    </div>
                  ))}
                  <div className={styles.checkRow} style={{ marginTop: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                    <input type="checkbox" id="docsConfirm" checked={form.hasRequiredDocs} onChange={(e) => update('hasRequiredDocs', e.target.checked)} />
                    <label htmlFor="docsConfirm" className={styles.checkLabel} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t('apply.fields.docsConfirm')}
                    </label>
                  </div>
                </>
              )}

              {/* STEP 3 – Confirm */}
              {step === 3 && (
                <>
                  <div className={styles.sectionTitle}>✅ {t('apply.steps.confirm')}</div>
                  <div style={{ background: 'rgba(248, 250, 252, 0.8)', borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                    {[
                      [t('apply.fields.firstName'), `${form.firstName} ${form.lastName}`],
                      [t('apply.fields.email'), form.email],
                      [t('apply.fields.phone'), form.phone || '—'],
                      [t('apply.fields.education'), form.education || '—'],
                      [t('apply.fields.experienceMonths'), form.experienceMonths ? `${form.experienceMonths} months` : '—'],
                      [t('apply.fields.shiftReady'), form.shiftReady ? 'Yes' : 'No'],
                      [t('apply.fields.manufacturingExp'), form.hasManufacturingExp ? 'Yes' : 'No'],
                      [t('apply.fields.computerSkill'), form.computerSkill],
                      [t('apply.fields.source'), form.source],
                    ].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.6)', fontSize: '0.9375rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center' }}>
                    By submitting, your application will be scored automatically and you\'ll be notified of the result.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.formActions}>
          {step > 0 ? (
            <button className={styles.btnSecondary} onClick={prev}>{t('apply.actions.back')}</button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <button className={styles.btnPrimary} onClick={next}>{t('apply.actions.next')}</button>
          ) : (
            <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
              {loading ? t('apply.actions.submitting') : t('apply.actions.submit')}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className={styles.page}>Loading...</div>}>
      <ApplyForm />
    </Suspense>
  );
}
