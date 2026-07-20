'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from '../login.module.css';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.logoRow}>
        <div className={styles.logoIcon}>N</div>
        Nexo HR
      </div>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('forgotPassword')}</h1>
        <p className={styles.subtitle}>{t('forgotPasswordHint')}</p>
        <div className={styles.linkGroup} style={{ marginTop: 0 }}>
          <Link href="/login" className={styles.link} style={{ marginLeft: 0 }}>
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
