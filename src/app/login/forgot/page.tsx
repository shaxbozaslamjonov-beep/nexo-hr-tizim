'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from '../login.module.css';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(data.message || t('forgotPasswordSent'));
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoRow}>
        <div className={styles.logoIcon}>N</div>
        Nexo HR
      </div>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('forgotPassword')}</h1>
        <p className={styles.subtitle}>{t('forgotPasswordHint')}</p>

        {error && <div className={styles.error}>{error}</div>}

        {submitted ? (
          <div className={styles.formGroup} style={{ color: 'rgba(247, 245, 239, 0.75)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>{t('email')}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="admin@nexo.com"
                required
              />
            </div>

            <button type="submit" className={styles.button} disabled={isLoading}>
              {isLoading ? '...' : t('forgotPasswordSubmit')}
            </button>
          </form>
        )}

        <div className={styles.linkGroup} style={{ marginTop: submitted ? '1.5rem' : undefined }}>
          <Link href="/login" className={styles.link} style={{ marginLeft: 0 }}>
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
