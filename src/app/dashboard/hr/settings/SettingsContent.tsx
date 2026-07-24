'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Shield, 
  Settings as SystemIcon, 
  Users as UsersIcon, 
  Camera,
  Save,
  Lock,
  Plus,
  Search,
  Key,
  Send,
  Building,
  Sliders,
  X,
  Check,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import styles from './settings.module.css';

type TabType = 'profile' | 'users' | 'rbac' | 'security' | 'telegram' | 'company';

interface UserItem {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  department?: string;
  position?: string;
  employeeId?: string;
  phone?: string;
  telegramId?: string;
  telegramUsername?: string;
  shift?: string;
}

export function SettingsContent() {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Personal profile password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Telegram test
  const [testTelegramId, setTestTelegramId] = useState('');
  const [testMessage, setTestMessage] = useState('Nexo HR: Test xabarnoma!');
  const [sendingTest, setSendingTest] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users.map((u: any) => ({
          id: u.id,
          email: u.email,
          role: u.role,
          isActive: true,
          firstName: u.employeeProfile?.firstName || 'Foydalanuvchi',
          lastName: u.employeeProfile?.lastName || '',
          department: u.employeeProfile?.department || 'Bo\'lim biriktirilmagan',
          position: u.employeeProfile?.position || u.role,
          employeeId: `EMP-${u.id.substring(0, 5).toUpperCase()}`,
          phone: '+998 90 123 45 67',
          telegramId: '',
          telegramUsername: '',
          shift: '1-smena (Morning)'
        })));
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleSaveOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      showToast('Yangi parollar mos kelmadi!', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Parolingiz muvaffaqiyatli o\'zgartirildi', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.error || 'Parolni o\'zgartirishda xatolik', 'error');
      }
    } catch (err) {
      showToast('Xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminResetPassword = async (userId: string) => {
    if (!newPasswordInput || newPasswordInput.length < 6) {
      showToast('Parol kamida 6 ta belgidan iborat bo\'lishi kerak', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPasswordInput }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Foydalanuvchi paroli tiklandi!', 'success');
        setResetPasswordUserId(null);
        setNewPasswordInput('');
      } else {
        showToast(data.error || 'Xatolik yuz berdi', 'error');
      }
    } catch (err) {
      showToast('Parolni tiklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUserModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editingUser.role,
          email: editingUser.email,
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          department: editingUser.department,
          position: editingUser.position,
        }),
      });
      if (res.ok) {
        showToast('Foydalanuvchi ma\'lumotlari saqlandi', 'success');
        setEditingUser(null);
        fetchUsers();
      } else {
        showToast('Xatolik yuz berdi', 'error');
      }
    } catch (err) {
      showToast('Saqlashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const role = formData.get('role') as string;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Yangi foydalanuvchi muvaffaqiyatli yaratildi!', 'success');
        setIsAddUserOpen(false);
        fetchUsers();
      } else {
        showToast(data.error || 'Yaratishda xatolik', 'error');
      }
    } catch (err) {
      showToast('Xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestTelegram = async () => {
    if (!testTelegramId) {
      showToast('Telegram Chat ID ni kiriting', 'error');
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch('/api/webhooks/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            chat: { id: testTelegramId },
            text: testMessage,
            from: { first_name: 'Admin' }
          }
        })
      });
      if (res.ok) {
        showToast('Test xabarnomasi yuborildi!', 'success');
      } else {
        showToast('Xabar yuborishda xatolik', 'error');
      }
    } catch (err) {
      showToast('Telegram API bilan bog\'lanishda xatolik', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.root}>
      
      {/* Hero Banner matching HR Dashboard */}
      <div className={styles.heroBanner}>
        <div className={styles.heroBgGlow} />
        <div className={styles.heroBadge}>
          <Sparkles size={14} />
          SYSTEM CONTROL & RBAC
        </div>
        <h1 className={styles.heroTitle}>Tizim Sozlamalari & RBAC Portal</h1>
        <p className={styles.heroText}>
          Foydalanuvchilar boshqaruvi, xavfsizlik qoidalari, Telegram integratsiyasi va RBAC ruxsatnomalarini markazlashgan holda boshqaring.
        </p>
      </div>

      {/* Main Navigation Sidebar & Content Layout */}
      <div className={styles.layoutGrid}>
        
        {/* Left Navigation Sidebar */}
        <div className={styles.navSidebar}>
          <button 
            type="button"
            onClick={() => setActiveTab('profile')} 
            className={`${styles.navTab} ${activeTab === 'profile' ? styles.navTabActive : ''}`}
          >
            <UserIcon size={18} />
            Shaxsiy Profil
          </button>

          {isAdmin && (
            <>
              <button 
                type="button"
                onClick={() => setActiveTab('users')} 
                className={`${styles.navTab} ${activeTab === 'users' ? styles.navTabActive : ''}`}
              >
                <UsersIcon size={18} />
                Foydalanuvchilar
              </button>

              <button 
                type="button"
                onClick={() => setActiveTab('rbac')} 
                className={`${styles.navTab} ${activeTab === 'rbac' ? styles.navTabActive : ''}`}
              >
                <Shield size={18} />
                Ruxsatnomalar (RBAC)
              </button>
            </>
          )}

          <button 
            type="button"
            onClick={() => setActiveTab('security')} 
            className={`${styles.navTab} ${activeTab === 'security' ? styles.navTabActive : ''}`}
          >
            <Lock size={18} />
            Login & Xavfsizlik
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('telegram')} 
            className={`${styles.navTab} ${activeTab === 'telegram' ? styles.navTabActive : ''}`}
          >
            <Send size={18} />
            Telegram Bot Integratsiya
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('company')} 
            className={`${styles.navTab} ${activeTab === 'company' ? styles.navTabActive : ''}`}
          >
            <Building size={18} />
            Kompaniya & Filiallar
          </button>
        </div>

        {/* Right Content */}
        <div className={styles.tabContent}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* TAB 1: SHAXSIY PROFIL */}
              {activeTab === 'profile' && (
                <div>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Shaxsiy Profil Sozlamalari</h2>
                      <p className={styles.sectionSub}>Profilingiz rekvizitlari va xavfsizlik paroli</p>
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>F.I.Sh *</label>
                      <input type="text" className={styles.formInput} defaultValue={`${user?.firstName || ''} ${user?.lastName || ''}`} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Telefon Raqami</label>
                      <input type="text" className={styles.formInput} defaultValue="+998 90 123 45 67" />
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                      <label className={styles.formLabel}>Elektron Pochta (Email) *</label>
                      <input type="email" className={styles.formInput} defaultValue={user?.email} disabled />
                    </div>
                  </div>

                  {/* Parolni Yangilash */}
                  <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
                    <h3 className={styles.sectionTitle} style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                      <Key size={20} style={{ display: 'inline', marginRight: '0.5rem', color: '#2563eb' }} />
                      Parolni Yangilash
                    </h3>
                    <form onSubmit={handleSaveOwnPassword} style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Joriy Parol</label>
                        <input 
                          type="password" 
                          required
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className={styles.formInput} 
                          placeholder="••••••••" 
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Yangi Parol</label>
                        <input 
                          type="password" 
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className={styles.formInput} 
                          placeholder="••••••••" 
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Yangi Parolni Tasdiqlash</label>
                        <input 
                          type="password" 
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className={styles.formInput} 
                          placeholder="••••••••" 
                        />
                      </div>
                      <button type="submit" disabled={loading} className={styles.btnPrimary} style={{ width: 'fit-content', marginTop: '0.5rem' }}>
                        <Save size={18} />
                        {loading ? 'Saqlanmoqda...' : 'Profilni Saqlash'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: FOYDALANUVCHILAR BOSHGARUV MARKAZI */}
              {activeTab === 'users' && isAdmin && (
                <div>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Foydalanuvchilar Boshqaruv Markazi</h2>
                      <p className={styles.sectionSub}>Jami: {users.length} ta foydalanuvchi mavjud</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsAddUserOpen(true)}
                      className={styles.btnPrimary}
                    >
                      <Plus size={18} />
                      + Yangi Foydalanuvchi
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className={styles.searchBox}>
                    <Search className={styles.searchIcon} size={18} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Ism, login, rol yoki ID bo'yicha qidirish..."
                      className={styles.searchInput}
                    />
                  </div>

                  {/* Users Table */}
                  <div className={styles.tableWrapper}>
                    <table className={styles.customTable}>
                      <thead>
                        <tr>
                          <th>Xodim</th>
                          <th>Login / Email</th>
                          <th>Rol</th>
                          <th>Holati</th>
                          <th style={{ textAlign: 'right' }}>Amallar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td>
                              <div className={styles.userCell}>
                                <div className={styles.avatarBadge}>
                                  {u.firstName?.[0]}{u.lastName?.[0]}
                                </div>
                                <div>
                                  <div className={styles.userName}>{u.firstName} {u.lastName}</div>
                                  <div className={styles.userSub}>{u.employeeId}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                              {u.email}
                            </td>
                            <td>
                              <span className={styles.roleTag}>{u.role}</span>
                            </td>
                            <td>
                              <span className={styles.statusTagActive}>FAOL</span>
                            </td>
                            <td>
                              <div className={styles.actionBtnGroup}>
                                <button 
                                  type="button"
                                  onClick={() => setEditingUser(u)}
                                  className={styles.actionBtn}
                                  title="Tahrirlash (Enterprise)"
                                >
                                  <SlidersHorizontal size={18} />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setResetPasswordUserId(u.id)}
                                  className={styles.actionBtn}
                                  style={{ color: '#d97706', borderColor: '#fde68a', background: '#fffbeb' }}
                                  title="Parolni tiklash"
                                >
                                  <Key size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: RUXSATNOMALAR (RBAC) MATRIX */}
              {activeTab === 'rbac' && isAdmin && (
                <div>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Ruxsatnomalar Matritsasi (RBAC Portal)</h2>
                      <p className={styles.sectionSub}>Rollarga ko'ra modullar va amallar bo'yicha ruxsat darajalari</p>
                    </div>
                  </div>

                  {/* Available Roles Pills Bar */}
                  <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MAVJUD ROLLAR:</span>
                    {['ADMIN', 'HR_MANAGER', 'DIRECTOR', 'DEPARTMENT_HEAD', 'EMPLOYEE', 'CANDIDATE'].map((r, i) => (
                      <span key={i} style={{ padding: '0.35rem 0.85rem', borderRadius: '12px', background: i === 0 ? '#1d4ed8' : '#f1f5f9', color: i === 0 ? 'white' : '#475569', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                        {r}
                      </span>
                    ))}
                  </div>

                  <div className={styles.tableWrapper}>
                    <table className={styles.customTable}>
                      <thead>
                        <tr>
                          <th>Modul / Ruxsat</th>
                          <th style={{ textAlign: 'center' }}>ADMIN</th>
                          <th style={{ textAlign: 'center' }}>HR MANAGER</th>
                          <th style={{ textAlign: 'center' }}>DIRECTOR</th>
                          <th style={{ textAlign: 'center' }}>DEPT HEAD</th>
                          <th style={{ textAlign: 'center' }}>EMPLOYEE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { category: '📊 Dashboard', permissions: [
                            { action: 'Ko\'rish: Dashboard', admin: true, hr: true, dir: true, head: true, emp: true },
                          ]},
                          { category: '📋 Nomzodlar & Vakansiyalar', permissions: [
                            { action: 'CRUD: Ko\'rish', admin: true, hr: true, dir: true, head: true, emp: false },
                            { action: 'CRUD: Yaratish', admin: true, hr: true, dir: true, head: false, emp: false },
                            { action: 'CRUD: O\'zgartirish', admin: true, hr: true, dir: true, head: false, emp: false },
                            { action: 'CRUD: O\'chirish', admin: true, hr: false, dir: false, head: false, emp: false },
                          ]},
                          { category: '👥 Xodimlar & Boshqaruv', permissions: [
                            { action: 'CRUD: Ko\'rish', admin: true, hr: true, dir: true, head: true, emp: false },
                            { action: 'CRUD: Yaratish', admin: true, hr: true, dir: true, head: false, emp: false },
                            { action: 'CRUD: O\'zgartirish', admin: true, hr: true, dir: true, head: true, emp: false },
                            { action: 'CRUD: O\'chirish', admin: true, hr: false, dir: false, head: false, emp: false },
                          ]},
                          { category: '🎓 O\'quv Modullari & Testlar', permissions: [
                            { action: 'Ko\'rish & Topshirish', admin: true, hr: true, dir: true, head: true, emp: true },
                            { action: 'Yangi darslar yaratish', admin: true, hr: true, dir: false, head: false, emp: false },
                          ]},
                          { category: '⚙️ Tizim Sozlamalari & RBAC', permissions: [
                            { action: 'Operatsiya turlari: Ko\'rish', admin: true, hr: false, dir: false, head: false, emp: false },
                            { action: 'Operatsiya turlari: O\'zgartirish', admin: true, hr: false, dir: false, head: false, emp: false },
                          ]},
                        ].map((group, gIdx) => (
                          <React.Fragment key={gIdx}>
                            <tr style={{ background: '#f8fafc' }}>
                              <td colSpan={6} style={{ fontWeight: 900, color: '#1e3a8a', fontSize: '0.85rem', padding: '0.75rem 1rem' }}>
                                {group.category}
                              </td>
                            </tr>
                            {group.permissions.map((p, pIdx) => (
                              <tr key={pIdx}>
                                <td style={{ paddingLeft: '2rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                  {p.action}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button type="button" className="p-1" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                    {p.admin ? <CheckCircle2 size={22} color="#16a34a" style={{ margin: '0 auto' }} /> : <X size={20} color="#cbd5e1" style={{ margin: '0 auto' }} />}
                                  </button>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button type="button" className="p-1" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                    {p.hr ? <CheckCircle2 size={22} color="#16a34a" style={{ margin: '0 auto' }} /> : <X size={20} color="#cbd5e1" style={{ margin: '0 auto' }} />}
                                  </button>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button type="button" className="p-1" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                    {p.dir ? <CheckCircle2 size={22} color="#16a34a" style={{ margin: '0 auto' }} /> : <X size={20} color="#cbd5e1" style={{ margin: '0 auto' }} />}
                                  </button>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button type="button" className="p-1" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                    {p.head ? <CheckCircle2 size={22} color="#16a34a" style={{ margin: '0 auto' }} /> : <X size={20} color="#cbd5e1" style={{ margin: '0 auto' }} />}
                                  </button>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button type="button" className="p-1" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                    {p.emp ? <CheckCircle2 size={22} color="#16a34a" style={{ margin: '0 auto' }} /> : <X size={20} color="#cbd5e1" style={{ margin: '0 auto' }} />}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
                    * Barcha ruxsatnomalarning o'zgarishi avtomatik ravishda tizim Audit log jurnaliga yozib boriladi.
                  </p>
                </div>
              )}


              {/* TAB 4: TELEGRAM BOT INTEGRATSIYA */}
              {activeTab === 'telegram' && (
                <div>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Send size={24} color="#0284c7" />
                        Telegram Bot Integratsiyasi
                      </h2>
                      <p className={styles.sectionSub}>Avtomatik bildirishnomalar va Telegram Webhook boshqaruvi</p>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#0369a1' }}>Bot Token Holati</span>
                      <span style={{ padding: '0.25rem 0.75rem', background: '#16a34a', color: 'white', fontWeight: 800, fontSize: '0.7rem', borderRadius: '20px' }}>FAOL (CONNECTED)</span>
                    </div>
                    <code style={{ display: 'block', padding: '0.85rem', background: 'white', borderRadius: '12px', border: '1px solid #e0f2fe', fontSize: '0.85rem', fontFamily: 'monospace', color: '#0369a1', wordBreak: 'break-all' }}>
                      8780931091:AAHW9_PWiStB0VACsJtyRPS8cF199DGHTNk
                    </code>
                  </div>

                  {/* Test Message Sender */}
                  <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 className={styles.sectionTitle} style={{ fontSize: '1rem' }}>Test Xabarnoma Yuborish</h3>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Telegram Chat ID</label>
                      <input 
                        type="text" 
                        value={testTelegramId}
                        onChange={e => setTestTelegramId(e.target.value)}
                        placeholder="Masalan: 1036054073" 
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Xabar Matni</label>
                      <textarea 
                        rows={3}
                        value={testMessage}
                        onChange={e => setTestMessage(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleSendTestTelegram}
                      disabled={sendingTest}
                      className={styles.btnPrimary}
                      style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', width: 'fit-content' }}
                    >
                      <Send size={18} />
                      {sendingTest ? 'Yuborilmoqda...' : 'Test Xabarini Yuborish'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: LOGIN & SECURITY */}
              {activeTab === 'security' && (
                <div>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Login & Xavfsizlik Qoidalari</h2>
                      <p className={styles.sectionSub}>Tizimga kirish xavfsizligi va 2FA OTP sozlamalari</p>
                    </div>
                  </div>
                  
                  <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Telegram 2FA Ikki Bosqichli Tasdiqlash</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Kirishda Telegram boti orqali tasdiqlash kodini yuborish</p>
                    </div>
                    <input type="checkbox" style={{ width: '20px', height: '20px' }} defaultChecked />
                  </div>
                </div>
              )}

              {/* TAB 6: COMPANY & BRANCHES */}
              {activeTab === 'company' && (
                <div>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Kompaniya & Filiallar</h2>
                      <p className={styles.sectionSub}>Tizim bo'yicha kompaniya ma'lumotlari</p>
                    </div>
                  </div>
                  <div className={styles.formGrid} style={{ maxWidth: '500px' }}>
                    <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                      <label className={styles.formLabel}>Kompaniya Nomi</label>
                      <input type="text" className={styles.formInput} defaultValue="Nexo HR Enterprise" />
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                      <label className={styles.formLabel}>Asosiy Til</label>
                      <select className={styles.formInput}>
                        <option value="uz">O'zbekcha (UZ)</option>
                        <option value="ru">Русский (RU)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ENTERPRISE USER EDIT MODAL */}
      {editingUser && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>FOYDALANUVCHINI TAHRIRLASH (ENTERPRISE)</span>
              <button type="button" onClick={() => setEditingUser(null)} className={styles.modalClose}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveUserModal} className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>F.I.Sh (To'liq Ism-Sharifi) *</label>
                  <input 
                    type="text" 
                    value={editingUser.firstName}
                    onChange={e => setEditingUser({...editingUser, firstName: e.target.value})}
                    className={styles.formInput} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Elektron Pochta (Email) *</label>
                  <input 
                    type="email" 
                    value={editingUser.email}
                    onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                    className={styles.formInput} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tizim Logini *</label>
                  <input type="text" defaultValue={editingUser.email.split('@')[0]} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Xodim ID (Employee ID) *</label>
                  <input type="text" defaultValue={editingUser.employeeId} className={styles.formInput} />
                </div>
              </div>

              {/* Password Reset Action inside modal */}
              <div style={{ padding: '1.25rem', borderRadius: '16px', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400e' }}>Foydalanuvchi Parolini Yangilash</span>
                <button 
                  type="button"
                  onClick={() => setResetPasswordUserId(editingUser.id)}
                  className={styles.btnPrimary}
                  style={{ background: '#d97706', padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
                >
                  <Key size={16} />
                  Parolni tiklash (Reset)
                </button>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bo'lim (RBAC)</label>
                  <select 
                    value={editingUser.department} 
                    onChange={e => setEditingUser({...editingUser, department: e.target.value})}
                    className={styles.formInput}
                  >
                    <option value="Administration">Raqbariyat</option>
                    <option value="HR">HR Bo'limi</option>
                    <option value="Production">Ishlab chiqarish</option>
                    <option value="QC">Sifat Nazorati (QC)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Lavozim (Position)</label>
                  <input 
                    type="text" 
                    value={editingUser.position} 
                    onChange={e => setEditingUser({...editingUser, position: e.target.value})}
                    className={styles.formInput} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Huquq Roli (RBAC)</label>
                  <select 
                    value={editingUser.role} 
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                    className={styles.formInput}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="HR_MANAGER">HR MANAGER</option>
                    <option value="DIRECTOR">DIRECTOR</option>
                    <option value="DEPARTMENT_HEAD">DEPARTMENT HEAD</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tizimda Holati (Status)</label>
                  <select className={styles.formInput}>
                    <option value="ACTIVE">Faol (Active)</option>
                    <option value="DISABLED">Bloklangan (Disabled)</option>
                  </select>
                </div>
              </div>

              {/* Telegram Integration */}
              <div style={{ paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>Telegram Integratsiya Sozlamalari</h4>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Telegram ID (Raqamli ID)</label>
                    <input 
                      type="text" 
                      placeholder="1036054073" 
                      value={editingUser.telegramId}
                      onChange={e => setEditingUser({...editingUser, telegramId: e.target.value})}
                      className={styles.formInput} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Telegram Username (@belgisiz)</label>
                    <input 
                      type="text" 
                      placeholder="Adele_nn" 
                      value={editingUser.telegramUsername}
                      onChange={e => setEditingUser({...editingUser, telegramUsername: e.target.value})}
                      className={styles.formInput} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setEditingUser(null)} className={styles.btnSecondary}>
                  Bekor Qilish
                </button>
                <button type="submit" disabled={loading} className={styles.btnPrimary}>
                  <Save size={18} />
                  Ma'lumotlarni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN RESET PASSWORD MODAL */}
      {resetPasswordUserId && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard} style={{ maxWidth: '450px' }}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Foydalanuvchi Parolini Tiklash</span>
              <button type="button" onClick={() => setResetPasswordUserId(null)} className={styles.modalClose}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Ushbu foydalanuvchi uchun yangi parol belgilang.</p>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Yangi Parol *</label>
                <input 
                  type="password" 
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  placeholder="Kamida 6 ta belgi"
                  className={styles.formInput} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setResetPasswordUserId(null)} className={styles.btnSecondary}>
                  Bekor Qilish
                </button>

                <button 
                  type="button" 
                  onClick={() => handleAdminResetPassword(resetPasswordUserId)} 
                  disabled={loading} 
                  className={styles.btnPrimary}
                  style={{ background: '#d97706' }}
                >
                  {loading ? 'Saqlanmoqda...' : 'Parolni O\'zgartirish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {isAddUserOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard} style={{ maxWidth: '450px' }}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Yangi Foydalanuvchi Yaratish</span>
              <button type="button" onClick={() => setIsAddUserOpen(false)} className={styles.modalClose}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ism *</label>
                <input name="firstName" required type="text" className={styles.formInput} placeholder="Alisher" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Familiya *</label>
                <input name="lastName" required type="text" className={styles.formInput} placeholder="Valiyev" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email *</label>
                <input name="email" required type="email" className={styles.formInput} placeholder="alisher@nexo.hr" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Boshlang'ich Parol *</label>
                <input name="password" required type="password" className={styles.formInput} placeholder="••••••••" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Rol</label>
                <select name="role" className={styles.formInput}>
                  <option value="HR_MANAGER">HR MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="DIRECTOR">DIRECTOR</option>
                  <option value="DEPARTMENT_HEAD">DEPARTMENT HEAD</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsAddUserOpen(false)} className={styles.btnSecondary}>
                  Bekor Qilish
                </button>
                <button type="submit" disabled={loading} className={styles.btnPrimary}>
                  {loading ? 'Saqlanmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
