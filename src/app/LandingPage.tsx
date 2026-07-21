'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [vacancies, setVacancies] = useState<PublicVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState<string | null>(null);

  const [contactForm, setContactForm] = useState({ fullName: '', phone: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContactStatus('submitting');
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) throw new Error('failed');
      setContactStatus('success');
      setContactForm({ fullName: '', phone: '', message: '' });
    } catch {
      setContactStatus('error');
    }
  };

  useEffect(() => {
    fetch('/api/public/vacancies')
      .then((res) => res.json())
      .then((data) => setVacancies(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(vacancies.map((v) => v.department))).sort(),
    [vacancies]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vacancies.filter((v) => {
      const matchesQuery = !q || v.title.toLowerCase().includes(q) || v.department.toLowerCase().includes(q);
      const matchesDept = !department || v.department === department;
      return matchesQuery && matchesDept;
    });
  }, [vacancies, query, department]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>N</div>
          Nexo HR
        </div>
        <div className={styles.headerActions}>
          <div className={styles.langSwitch}>
            <button
              className={`${styles.langBtn} ${language === 'uz' ? styles.langActive : ''}`}
              onClick={() => setLanguage('uz')}
            >
              UZ
            </button>
            <div className={styles.langDivider} />
            <button
              className={`${styles.langBtn} ${language === 'ru' ? styles.langActive : ''}`}
              onClick={() => setLanguage('ru')}
            >
              RU
            </button>
          </div>
          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link href="/login" className={styles.loginBtn}>{t('landing.login')}</Link>
        </div>
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

        {!loading && vacancies.length > 0 && (
          <div className={styles.filterBar}>
            <div className={styles.searchWrap}>
              <Search size={17} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder={t('landing.searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className={styles.deptChips}>
              <button
                className={`${styles.chip} ${department === null ? styles.chipActive : ''}`}
                onClick={() => setDepartment(null)}
              >
                {t('landing.allDepartments')}
              </button>
              {departments.map((d) => (
                <button
                  key={d}
                  className={`${styles.chip} ${department === d ? styles.chipActive : ''}`}
                  onClick={() => setDepartment(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? null : vacancies.length === 0 ? (
          <div className={styles.empty}>{t('landing.noVacancies')}</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>{t('landing.noResults')}</div>
        ) : (
          <div className={styles.grid}>
            <AnimatePresence mode="popLayout">
              {filtered.map((v, i) => (
                <motion.div
                  className={styles.card}
                  key={v.id}
                  layout
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
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
            </AnimatePresence>
          </div>
        )}
      </section>

      <section className={styles.aboutSection}>
        <div className={styles.aboutInner}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTick} />
            <h2 className={styles.sectionTitle}>{t('landing.about.title')}</h2>
          </div>
          <p className={styles.aboutLead}>{t('landing.about.lead')}</p>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutCard}>
              <div className={styles.aboutCardTitle}>{t('landing.about.missionTitle')}</div>
              <p className={styles.aboutCardText}>{t('landing.about.missionText')}</p>
            </div>
            <div className={styles.aboutCard}>
              <div className={styles.aboutCardTitle}>{t('landing.about.futureTitle')}</div>
              <p className={styles.aboutCardText}>{t('landing.about.futureText')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.saasSection}>
        <div className={styles.saasBanner}>
          <div>
            <div className={styles.saasTitle}>{t('landing.saas.title')}</div>
            <p className={styles.saasText}>{t('landing.saas.text')}</p>
          </div>
          <Link href="/register" className={styles.saasBtn}>{t('landing.saas.cta')} →</Link>
        </div>
      </section>

      <section className={styles.contactSection}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTick} />
          <h2 className={styles.sectionTitle}>{t('landing.contact.title')}</h2>
        </div>
        <p className={styles.aboutLead} style={{ color: '#5B6472' }}>{t('landing.contact.lead')}</p>

        <form className={styles.contactForm} onSubmit={handleContactSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="contact-name">{t('landing.contact.fullName')}</label>
              <input
                id="contact-name"
                className={styles.formInput}
                placeholder={t('landing.contact.fullNamePlaceholder')}
                value={contactForm.fullName}
                onChange={(e) => setContactForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="contact-phone">{t('landing.contact.phone')}</label>
              <input
                id="contact-phone"
                type="tel"
                className={styles.formInput}
                placeholder={t('landing.contact.phonePlaceholder')}
                value={contactForm.phone}
                onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="contact-message">{t('landing.contact.message')}</label>
            <textarea
              id="contact-message"
              className={styles.formTextarea}
              placeholder={t('landing.contact.messagePlaceholder')}
              value={contactForm.message}
              onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
              required
            />
          </div>

          {contactStatus === 'success' && <div className={styles.formSuccess}>{t('landing.contact.success')}</div>}
          {contactStatus === 'error' && <div className={styles.formError}>{t('landing.contact.error')}</div>}

          <button type="submit" className={styles.formSubmit} disabled={contactStatus === 'submitting'}>
            {contactStatus === 'submitting' ? t('landing.contact.submitting') : t('landing.contact.submit')}
          </button>
        </form>
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Nexo HR — {t('landing.footerTagline')}
      </footer>
    </div>
  );
}
