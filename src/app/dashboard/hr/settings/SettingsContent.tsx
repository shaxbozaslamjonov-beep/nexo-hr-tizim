'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Shield, 
  Bell, 
  Settings as SystemIcon, 
  Users as UsersIcon, 
  Database,
  Camera,
  Save,
  Trash2,
  Lock,
  Plus,
  Eye,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { userSettingsService } from '@/lib/services/userSettingsService';
import { systemSettingsService } from '@/lib/services/systemSettingsService';
import { adminUserService } from '@/lib/services/adminUserService';
import { User, UserSettings, SystemSettings } from '@/types';
import styles from './settings.module.css';

type TabType = 'profile' | 'account' | 'notifications' | 'system' | 'users' | 'data';

export function SettingsContent() {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [sysSettings, setSysSettings] = useState<SystemSettings | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user) {
      setSettings(user.settings);
    }
    if (isAdmin) {
      setSysSettings(systemSettingsService.getSettings());
      setAllUsers(adminUserService.getUsers());
    }
  }, [user, isAdmin]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !settings) return;
    setLoading(true);
    try {
      await userSettingsService.updateSettings(user.id, settings);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(true); // Artificial delay or just state update
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleSaveSystem = async () => {
    if (!sysSettings) return;
    setLoading(true);
    try {
      await systemSettingsService.updateSettings(sysSettings);
      showToast('System settings updated', 'success');
    } catch (err) {
      showToast('Failed to update system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab settings={settings} setSettings={setSettings} onSave={handleSaveProfile} loading={loading} />;
      case 'account': return <AccountTab />;
      case 'notifications': return <NotificationsTab settings={settings} setSettings={setSettings} onSave={handleSaveProfile} loading={loading} />;
      case 'system': return isAdmin ? <SystemTab sysSettings={sysSettings} setSysSettings={setSysSettings} onSave={handleSaveSystem} loading={loading} /> : null;
      case 'users': return isAdmin ? <UsersTab users={allUsers} setUsers={setAllUsers} /> : null;
      case 'data': return isAdmin ? <DataTab /> : null;
      default: return null;
    }
  };

  if (!user || !settings) return null;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('settings.title')}</h1>
        <p className={styles.subtitle}>Manage your account and platform preferences</p>
      </div>

      <div className={styles.tabs}>
        {(['profile', 'account', 'notifications'] as TabType[]).map(tab => (
          <button 
            key={tab} 
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {t(`settings.tabs.${tab}`)}
          </button>
        ))}
        {isAdmin && (['system', 'users', 'data'] as TabType[]).map(tab => (
          <button 
            key={tab} 
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {t(`settings.tabs.${tab}`)}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- TAB COMPONENTS ---

function ProfileTab({ settings, setSettings, onSave, loading }: any) {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user || !settings) return null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}><UserIcon size={24} /></div>
        <h2 className={styles.cardTitle}>{t('settings.profile.personalTitle')}</h2>
      </div>

      <div className={styles.profileGrid}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {user.firstName[0]}{user.lastName[0]}
            <div className={styles.avatarOverlay}><Camera size={32} /></div>
          </div>
          <button className={styles.btnSecondary} style={{ width: '100%', fontSize: '0.85rem' }}>
            {t('settings.profile.uploadBtn')}
          </button>
          <p className={styles.settingDesc} style={{ textAlign: 'center' }}>
            JPG, PNG or GIF. Max 5MB.
          </p>
        </div>

        <form onSubmit={onSave} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('settings.profile.firstName')}</label>
            <input className={styles.input} defaultValue={user.firstName} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('settings.profile.lastName')}</label>
            <input className={styles.input} defaultValue={user.lastName} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('settings.profile.email')}</label>
            <input className={styles.input} defaultValue={user.email} disabled />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('settings.profile.phone')}</label>
            <input className={styles.input} placeholder="+998 90 123 45 67" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('settings.profile.jobTitle')}</label>
            <input className={styles.input} defaultValue={user.role} disabled />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('settings.profile.department')}</label>
            <input className={styles.input} placeholder="HR / Engineering" />
          </div>
          
          <div className={styles.footer}  style={{ gridColumn: 'span 2' }}>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : t('settings.profile.saveBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AccountTab() {
  const { t } = useLanguage();
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}><Shield size={24} /></div>
        <h2 className={styles.cardTitle}>{t('settings.account.securityTitle')}</h2>
      </div>
      
      <div style={{ maxWidth: '600px' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          {t('settings.account.changePassword')}
        </h3>
        <div className={styles.formGrid} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('settings.account.oldPassword')}</label>
            <input type="password" className={styles.input} placeholder="••••••••" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('settings.account.newPassword')}</label>
            <input type="password" className={styles.input} placeholder="••••••••" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('settings.account.confirmPassword')}</label>
            <input type="password" className={styles.input} placeholder="••••••••" />
          </div>
          <div className={styles.footer} style={{ justifyContent: 'flex-start' }}>
            <button className={styles.btnPrimary}>{t('save')}</button>
          </div>
        </div>

        <div style={{ height: '1px', background: '#f1f5f9', margin: '3rem 0' }} />

        <div className={styles.settingRow}>
           <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>{t('settings.account.twoFactor')}</div>
              <div className={styles.settingDesc}>Add an extra layer of security to your account.</div>
           </div>
           <button className={styles.btnSecondary} style={{ width: 'auto' }}>Enable</button>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab({ settings, setSettings, onSave, loading }: any) {
  const { t } = useLanguage();
  
  const updateNotif = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}><Bell size={24} /></div>
        <h2 className={styles.cardTitle}>{t('settings.notifications.channelsTitle')}</h2>
      </div>

      <div style={{ maxWidth: '700px' }}>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingTitle}>{t('settings.notifications.emailNotify')}</div>
            <div className={styles.settingDesc}>Receive specialized updates via your registered email.</div>
          </div>
          <label className={styles.switch}>
            <input type="checkbox" checked={settings.notifications.email} onChange={(e) => updateNotif('email', e.target.checked)} />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingTitle}>{t('settings.notifications.pushNotify')}</div>
            <div className={styles.settingDesc}>Receive critical alerts on your device using push technologies.</div>
          </div>
          <label className={styles.switch}>
            <input type="checkbox" checked={settings.notifications.push} onChange={(e) => updateNotif('push', e.target.checked)} />
            <span className={styles.slider}></span>
          </label>
        </div>

        <h3 style={{ fontWeight: 800, margin: '3rem 0 1.5rem', color: 'var(--text-secondary)' }}>
          {t('settings.notifications.eventsTitle')}
        </h3>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingTitle}>{t('settings.notifications.interviewReminders')}</div>
            <div className={styles.settingDesc}>Get notified 1 hour before scheduled interviews.</div>
          </div>
          <label className={styles.switch}>
            <input type="checkbox" checked={settings.notifications.interviewReminders} onChange={(e) => updateNotif('interviewReminders', e.target.checked)} />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingTitle}>{t('settings.notifications.newApplications')}</div>
            <div className={styles.settingDesc}>Alert when a candidate applies for an open vacancy.</div>
          </div>
          <label className={styles.switch}>
            <input type="checkbox" checked={settings.notifications.newApplications} onChange={(e) => updateNotif('newApplications', e.target.checked)} />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.footer}>
           <button className={styles.btnPrimary} onClick={onSave} disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : t('save')}
           </button>
        </div>
      </div>
    </div>
  );
}

function SystemTab({ sysSettings, setSysSettings, onSave, loading }: any) {
  const { t } = useLanguage();
  
  if (!sysSettings) return null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}><SystemIcon size={24} /></div>
        <h2 className={styles.cardTitle}>{t('settings.system.generalTitle')}</h2>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('settings.system.companyName')}</label>
          <input 
            className={styles.input} 
            value={sysSettings.companyName} 
            onChange={e => setSysSettings({...sysSettings, companyName: e.target.value})}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('settings.system.defaultLang')}</label>
          <select 
            className={styles.input}
            value={sysSettings.defaultLanguage}
            onChange={e => setSysSettings({...sysSettings, defaultLanguage: e.target.value})}
          >
            <option value="uz">Uzbek (O'zbek)</option>
            <option value="ru">Russian (Русский)</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('settings.system.timezone')}</label>
          <select className={styles.input}>
            <option value="Tashkent">Tashkent (GMT+5)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('settings.system.interviewDuration')}</label>
          <input 
            type="number" 
            className={styles.input} 
            value={sysSettings.interviewDuration}
            onChange={e => setSysSettings({...sysSettings, interviewDuration: parseInt(e.target.value)})}
          />
        </div>

        <div className={styles.fullWidth} style={{ borderTop: '1px solid #f1f5f9', marginTop: '1rem', paddingTop: '2rem' }}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>{t('settings.system.autoScore')}</div>
              <div className={styles.settingDesc}>Automatically calculate candidate scores based on criteria.</div>
            </div>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={sysSettings.autoCalculateScore} 
                onChange={e => setSysSettings({...sysSettings, autoCalculateScore: e.target.checked})}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.footer}  style={{ gridColumn: 'span 2' }}>
          <button className={styles.btnPrimary} onClick={onSave} disabled={loading}>
            <Save size={18} />
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ users, setUsers }: any) {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const handleToggleStatus = (id: string) => {
    const updated = adminUserService.toggleUserStatus(id);
    if (updated) {
      setUsers(users.map((u: User) => u.id === id ? updated : u));
      showToast('User status updated', 'success');
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}><UsersIcon size={24} /></div>
        <h2 className={styles.cardTitle}>{t('settings.users.managementTitle')}</h2>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className={styles.btnPrimary}>
          <Plus size={18} />
          {t('settings.users.addUser')}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('settings.users.table.name')}</th>
              <th>{t('settings.users.table.role')}</th>
              <th>{t('settings.users.table.status')}</th>
              <th>{t('settings.users.table.lastLogin')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: User) => (
              <tr key={u.id} className={styles.tableRow}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>{u.firstName[0]}{u.lastName[0]}</div>
                    <div>
                      <div className={styles.userName}>{u.firstName} {u.lastName}</div>
                      <div className={styles.userEmail}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${u.role.toLowerCase()}`} style={{ fontSize: '0.75rem' }}>{u.role}</span>
                </td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-hired' : 'badge-rejected'}`} style={{ fontSize: '0.75rem' }}>
                    {u.isActive ? t('settings.users.status.active') : t('settings.users.status.disabled')}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <button className={styles.iconBtn} title="View Details"><Eye size={16} /></button>
                  <button className={styles.iconBtn} title="Edit User"><Lock size={16} /></button>
                  <button 
                    className={`${styles.iconBtn} ${styles.dangerBtn}`} 
                    title={u.isActive ? "Disable User" : "Enable User"}
                    onClick={() => handleToggleStatus(u.id)}
                  >
                    {u.isActive ? <Trash2 size={16} /> : <CheckCircle size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataTab() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const handleAction = (label: string) => {
    showToast(`Action started: ${label}`, 'info');
    setTimeout(() => showToast('Action completed successfully', 'success'), 1500);
  };

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}><Database size={24} /></div>
          <h2 className={styles.cardTitle}>{t('settings.data.managementTitle')}</h2>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.card} style={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={20} color="var(--primary)" />
              {t('settings.data.exportTitle')}
            </h3>
            <p className={styles.settingDesc} style={{ marginBottom: '1.5rem' }}>
              Download all platform data in JSON or Excel format.
            </p>
            <button className={styles.btnSecondary} onClick={() => handleAction('Export')} style={{ width: '100%' }}>Export All</button>
          </div>

          <div className={styles.card} style={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={20} color="#8b5cf6" />
              {t('settings.data.importTitle')}
            </h3>
            <p className={styles.settingDesc} style={{ marginBottom: '1.5rem' }}>
              Import candidates or vacancies from a CSV file.
            </p>
            <button className={styles.btnSecondary} style={{ width: '100%' }}>Select File</button>
          </div>
        </div>

        <div style={{ height: '1px', background: '#f1f5f9', margin: '3rem 0' }} />

        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2rem', borderRadius: '20px' }}>
          <h3 style={{ fontWeight: 800, color: 'var(--error)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} />
            {t('settings.data.cleanupTitle')}
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#7f1d1d', marginBottom: '1.5rem' }}>
            {t('settings.data.cleanupWarning')}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={styles.btnSecondary} style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleAction('Clear Applications')}>
               {t('settings.data.deleteApplications')}
            </button>
            <button className={styles.btnPrimary} style={{ background: '#ef4444' }} onClick={() => handleAction('Wipe All')}>
               {t('settings.data.deleteAllData')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
