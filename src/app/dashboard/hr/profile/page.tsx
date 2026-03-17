'use client';

import { User, Mail, Shield, Camera, Key } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import styles from '../dashboard.module.css';

export default function ProfilePage() {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in">
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>{t('profile')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Profile Card */}
        <div className={styles.tableContainer} style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--grad-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>
              SA
            </div>
            <button style={{ position: 'absolute', bottom: '0', right: '0', width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <Camera size={18} color="#64748b" />
            </button>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>Super Admin</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>HR Lead Specialist</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.9rem' }}>
              <Mail size={18} />
              admin@nexohr.uz
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.9rem' }}>
              <Shield size={18} />
              Full System Access
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className={styles.tableContainer} style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Личные данные</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>Имя</label>
              <input type="text" defaultValue="Super" className={styles.searchInput} style={{ width: '100%', maxWidth: 'none', background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>Фамилия</label>
              <input type="text" defaultValue="Admin" className={styles.searchInput} style={{ width: '100%', maxWidth: 'none', background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>Email</label>
              <input type="email" defaultValue="admin@nexohr.uz" className={styles.searchInput} style={{ width: '100%', maxWidth: 'none', background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>Телефон</label>
              <input type="text" defaultValue="+998 90 123 45 67" className={styles.searchInput} style={{ width: '100%', maxWidth: 'none', background: '#f8fafc' }} />
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} />
            Безопасность
          </h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Сменить пароль
            </button>
            <button style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Двухфакторная аутентификация
            </button>
          </div>

          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
