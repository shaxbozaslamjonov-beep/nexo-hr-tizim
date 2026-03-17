'use client';

import { Search, Bell, Globe, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSearch } from '@/contexts/SearchContext';
import styles from './header.module.css';

interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  collapsed: boolean;
  userName: string;
}

export function Header({ breadcrumbs = [], collapsed, userName, hideSearch = false }: HeaderProps & { hideSearch?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const { searchQuery, setSearchQuery } = useSearch();

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {!hideSearch && (
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder={t('search')} 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={styles.searchShortcut}>
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.actions}>
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

        <button className={styles.iconBtn}>
          <Bell size={20} />
          <span className={styles.notificationBadge}>3</span>
        </button>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{t('hrManager') || 'HR Administrator'}</span>
          </div>
          <div className={styles.avatar}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}


