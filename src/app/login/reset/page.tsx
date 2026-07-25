'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from '../login.module.css';

function ResetPasswordForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Xatolik yuz berdi');
      }
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  if (!token) {
    return (
      <div className={styles.card}>
        <h1 className={styles.title}>{t('resetPasswordTitle')}</h1>
        <div className={styles.error}>{t('resetPasswordInvalidLink')}</div>
        <div className={styles.linkGroup} style={{ marginTop: 0 }}>
          <Link href="/login/forgot" className={styles.link} style={{ marginLeft: 0 }}>
            {t('forgotPassword')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>{t('resetPasswordTitle')}</h1>
      <p className={styles.subtitle}>{t('resetPasswordHint')}</p>

      {error && <div className={styles.error}>{error}</div>}

      {done ? (
        <div className={styles.formGroup} style={{ color: 'rgba(247, 245, 239, 0.75)', fontSize: '0.9rem' }}>
          {t('resetPasswordSuccess')}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>{t('password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>{t('confirmPassword')}</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? '...' : t('resetPasswordSubmit')}
          </button>
        </form>
      )}

      <div className={styles.linkGroup}>
        <Link href="/login" className={styles.link} style={{ marginLeft: 0 }}>
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.container}>
      <div className={styles.logoRow}>
        <div className={styles.logoIcon}>N</div>
        Nexo HR
      </div>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
