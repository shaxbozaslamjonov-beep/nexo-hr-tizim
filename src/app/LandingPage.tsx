'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from './landing.module.css';

interface PublicVacancy {
  id: string;
  title: string;
  department: string;
  salaryRange?: string | null;
  shift?: string | null;
  description: string;
}

export function LandingPage() {
  const { t } = useLanguage();
  const [vacancies, setVacancies] = useState<PublicVacancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/vacancies')
      .then((res) => res.json())
      .then((data) => setVacancies(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>N</div>
          Nexo HR
        </div>
        <Link href="/login" className={styles.loginBtn}>{t('landing.login')}</Link>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>{t('landing.heroTitle')}</h1>
        <p className={styles.heroSubtitle}>{t('landing.heroSubtitle')}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('landing.vacancies')}</h2>
        {loading ? null : vacancies.length === 0 ? (
          <div className={styles.empty}>{t('landing.noVacancies')}</div>
        ) : (
          <div className={styles.grid}>
            {vacancies.map((v) => (
              <div className={styles.card} key={v.id}>
                <div className={styles.cardTitle}>{v.title}</div>
                <div className={styles.cardMeta}>
                  <span>{v.department}</span>
                  {v.salaryRange && <span>{v.salaryRange}</span>}
                  {v.shift && <span>{v.shift}</span>}
                </div>
                <p className={styles.cardDesc}>{v.description}</p>
                <Link href={`/apply?vacancy=${v.id}`} className={styles.applyBtn}>
                  {t('landing.apply')}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Nexo HR Platform
      </footer>
    </div>
  );
}
