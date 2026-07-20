'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { springSnappy } from '@/lib/motion';
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
      <motion.div
        className={styles.scanLine}
        initial={{ top: '-5%', opacity: 0 }}
        animate={{ top: '105%', opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.15 }}
      />

      <div className={styles.logoRow}>
        <div className={styles.logoIcon}>N</div>
        Nexo HR
      </div>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={springSnappy}
      >
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          {t('landing.eyebrow')}
        </span>
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
      </motion.div>
    </div>
  );
}
