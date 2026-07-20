'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

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
        <motion.div
          className={styles.scanLine}
          initial={{ top: '-5%', opacity: 0 }}
          animate={{ top: '105%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.div
          className={styles.heroInner}
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <motion.span className={styles.eyebrow} variants={heroItem}>
            <span className={styles.eyebrowDot} />
            {t('landing.eyebrow')}
          </motion.span>
          <motion.h1 className={styles.heroTitle} variants={heroItem}>
            {t('landing.heroTitleA')} <em>{t('landing.heroTitleB')}</em>
          </motion.h1>
          <motion.p className={styles.heroSubtitle} variants={heroItem}>
            {t('landing.heroSubtitle')}
          </motion.p>
          <motion.div className={styles.statStrip} variants={heroItem}>
            <motion.span
              className={styles.pulse}
              animate={{ scale: [1, 1.35, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className={styles.statNumber}>{loading ? '—' : vacancies.length}</span>
            {t('landing.openPositions')}
          </motion.div>
        </motion.div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTick} />
          <h2 className={styles.sectionTitle}>{t('landing.vacancies')}</h2>
        </div>
        {loading ? null : vacancies.length === 0 ? (
          <div className={styles.empty}>{t('landing.noVacancies')}</div>
        ) : (
          <div className={styles.grid}>
            {vacancies.map((v, i) => (
              <motion.div
                className={styles.card}
                key={v.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className={styles.cardTitle}>{v.title}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.tag}>{v.department}</span>
                  {v.salaryRange && <span className={`${styles.tag} ${styles.tagAccent}`}>{v.salaryRange}</span>}
                  {v.shift && <span className={styles.tag}>{v.shift}</span>}
                </div>
                <p className={styles.cardDesc}>{v.description}</p>
                <Link href={`/apply?vacancy=${v.id}`} className={styles.applyBtn}>
                  {t('landing.apply')} →
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} NEXO_HR // ALL_SYSTEMS_OPERATIONAL
      </footer>
    </div>
  );
}
