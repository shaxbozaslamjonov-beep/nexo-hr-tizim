'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from './login.module.css';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Nexo HR</h1>
        <p className={styles.subtitle}>{t('signIn')}</p>

        {error && <div className={styles.error}>{error}</div>}

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
            />
          </div>

          <Link href="/login/forgot" className={styles.forgotPassword}>
            {t('forgotPassword')}
          </Link>

          <div className={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="remember" 
              className={styles.checkbox}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember" className={styles.label}>{t('rememberMe')}</label>
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? '...' : t('signIn')}
          </button>
        </form>

        <div className={styles.linkGroup}>
          {t('noAccount')} 
          <Link href="/register" className={styles.link}>
            {t('signUp')}
          </Link>
        </div>
      </div>
    </div>
  );
}
