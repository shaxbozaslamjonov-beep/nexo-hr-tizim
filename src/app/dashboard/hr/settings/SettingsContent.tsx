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
  Upload,
  Send,
  RefreshCw,
  Search,
  Key,
  Smartphone,
  Building,
  Sliders,
  X,
  Check
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
  telegramBotAccess?: boolean;
  telegram2FA?: boolean;
  avatarUrl?: string;
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

  // Personal profile change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Telegram test state
  const [testTelegramId, setTestTelegramId] = useState('');
  const [testMessage, setTestMessage] = useState('Nexo HR: Test xabarnoma!');
  const [sendingTest, setSendingTest] = useState(false);

  // Fetch users from Database
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
          telegramBotAccess: true,
          telegram2FA: false,
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
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Sliders className="h-7 w-7 text-indigo-600" />
            Tizim Sozlamalari & RBAC Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Foydalanuvchilar, kompaniya filiallari, xavfsizlik qoidalari, AI va tizim boshqaruvi
          </p>
        </div>
      </div>

      {/* Main Tab Navigation & Content Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm h-fit">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <UserIcon className="h-5 w-5" />
            Shaxsiy Profil
          </button>

          {isAdmin && (
            <>
              <button 
                onClick={() => setActiveTab('users')} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                <UsersIcon className="h-5 w-5" />
                Foydalanuvchilar
              </button>

              <button 
                onClick={() => setActiveTab('rbac')} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'rbac' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                <Shield className="h-5 w-5" />
                Ruxsatnomalar (RBAC)
              </button>
            </>
          )}

          <button 
            onClick={() => setActiveTab('security')} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <Lock className="h-5 w-5" />
            Login & Xavfsizlik
          </button>

          <button 
            onClick={() => setActiveTab('telegram')} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'telegram' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <Send className="h-5 w-5" />
            Telegram Bot Integratsiya
          </button>

          <button 
            onClick={() => setActiveTab('company')} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'company' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <Building className="h-5 w-5" />
            Kompaniya & Filiallar
          </button>
        </div>

        {/* Right Tab Content Container */}
        <div className="lg:col-span-3">
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
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shaxsiy Profil Sozlamalari</h2>
                    <p className="text-sm text-slate-500 mt-1">Profilingiz rekvizitlari va xavfsizlik sozlamalari</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">F.I.Sh *</label>
                      <input type="text" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold" defaultValue={`${user?.firstName || ''} ${user?.lastName || ''}`} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Telefon Raqami</label>
                      <input type="text" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold" defaultValue="+998 90 123 45 67" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Elektron Pochta (Email) *</label>
                      <input type="email" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold" defaultValue={user?.email} disabled />
                    </div>
                  </div>

                  {/* Parolni Yangilash */}
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Key className="h-5 w-5 text-indigo-600" />
                      Parolni Yangilash
                    </h3>
                    <form onSubmit={handleSaveOwnPassword} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Joriy Parol</label>
                        <input 
                          type="password" 
                          required
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium" 
                          placeholder="••••••••" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Yangi Parol</label>
                        <input 
                          type="password" 
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium" 
                          placeholder="••••••••" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Yangi Parolni Tasdiqlash</label>
                        <input 
                          type="password" 
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium" 
                          placeholder="••••••••" 
                        />
                      </div>
                      <button type="submit" disabled={loading} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? 'Saqlanmoqda...' : 'Profilni Saqlash'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: FOYDALANUVCHILAR BOSHGARUV MARKAZI */}
              {activeTab === 'users' && isAdmin && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Foydalanuvchilar Boshqaruv Markazi</h2>
                      <p className="text-xs font-semibold text-slate-400 mt-1">Jami: {users.length} ta foydalanuvchi</p>
                    </div>
                    <button 
                      onClick={() => setIsAddUserOpen(true)}
                      className="px-5 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      + Yangi Foydalanuvchi
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Ism, login, rol yoki ID bo'yicha qidirish..."
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3 px-2">Xodim</th>
                          <th className="pb-3 px-2">Login / Email</th>
                          <th className="pb-3 px-2">Rol</th>
                          <th className="pb-3 px-2">Holati</th>
                          <th className="pb-3 px-2 text-right">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-4 px-2">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-extrabold text-sm">
                                  {u.firstName?.[0]}{u.lastName?.[0]}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white text-sm">{u.firstName} {u.lastName}</div>
                                  <div className="text-xs text-slate-400 font-mono">{u.employeeId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {u.email}
                            </td>
                            <td className="py-4 px-2">
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold text-[10px] tracking-wider rounded-lg uppercase">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 px-2">
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] rounded-lg">
                                FAOL
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right space-x-2">
                              <button 
                                onClick={() => setEditingUser(u)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors"
                                title="Tahrirlash (Enterprise)"
                              >
                                <Sliders className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => setResetPasswordUserId(u.id)}
                                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors"
                                title="Parolni tiklash"
                              >
                                <Key className="h-4 w-4" />
                              </button>
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
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ruxsatnomalar Matritsasi (RBAC Portal)</h2>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Rollarga ko'ra modullar bo'yicha ruxsat darajalari</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase">
                          <th className="pb-4 px-3">Modul / Funktsiya</th>
                          <th className="pb-4 px-3 text-center">ADMIN</th>
                          <th className="pb-4 px-3 text-center">HR MANAGER</th>
                          <th className="pb-4 px-3 text-center">DIRECTOR</th>
                          <th className="pb-4 px-3 text-center">DEPT HEAD</th>
                          <th className="pb-4 px-3 text-center">EMPLOYEE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                        {[
                          { name: 'Dashboard & Analitika', admin: true, hr: true, dir: true, head: true, emp: false },
                          { name: 'Nomzodlar & Vakansiyalar', admin: true, hr: true, dir: true, head: false, emp: false },
                          { name: 'Xodimlar & Boshqaruv', admin: true, hr: true, dir: true, head: true, emp: false },
                          { name: 'O\'quv Modullari & Testlar', admin: true, hr: true, dir: false, head: false, emp: true },
                          { name: 'Tizim Sozlamalari & RBAC', admin: true, hr: false, dir: false, head: false, emp: false },
                          { name: 'Telegram Bot & Xabarnomalar', admin: true, hr: true, dir: true, head: false, emp: false },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="py-4 px-3 font-bold text-slate-900 dark:text-white">{row.name}</td>
                            <td className="py-4 px-3 text-center">{row.admin ? <Check className="h-5 w-5 text-emerald-500 mx-auto" /> : <X className="h-5 w-5 text-slate-300 mx-auto" />}</td>
                            <td className="py-4 px-3 text-center">{row.hr ? <Check className="h-5 w-5 text-emerald-500 mx-auto" /> : <X className="h-5 w-5 text-slate-300 mx-auto" />}</td>
                            <td className="py-4 px-3 text-center">{row.dir ? <Check className="h-5 w-5 text-emerald-500 mx-auto" /> : <X className="h-5 w-5 text-slate-300 mx-auto" />}</td>
                            <td className="py-4 px-3 text-center">{row.head ? <Check className="h-5 w-5 text-emerald-500 mx-auto" /> : <X className="h-5 w-5 text-slate-300 mx-auto" />}</td>
                            <td className="py-4 px-3 text-center">{row.emp ? <Check className="h-5 w-5 text-emerald-500 mx-auto" /> : <X className="h-5 w-5 text-slate-300 mx-auto" />}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: TELEGRAM BOT INTEGRATSIYA */}
              {activeTab === 'telegram' && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Send className="h-6 w-6 text-sky-500" />
                      Telegram Bot Integratsiyasi
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Avtomatik bildirishnomalar va Telegram Webhook boshqaruvi</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-sky-700 dark:text-sky-300">Bot Token Holati</span>
                      <span className="px-3 py-1 bg-emerald-500 text-white font-extrabold text-[10px] rounded-full">FAOL (CONNECTED)</span>
                    </div>
                    <code className="block p-3 bg-white dark:bg-slate-950 rounded-xl border border-sky-100 text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                      8780931091:AAHW9_PWiStB0VACsJtyRPS8cF199DGHTNk
                    </code>
                  </div>

                  {/* Test Message Sender */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Test Xabarnoma Yuborish</h3>
                    <div className="space-y-3 max-w-lg">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telegram Chat ID</label>
                        <input 
                          type="text" 
                          value={testTelegramId}
                          onChange={e => setTestTelegramId(e.target.value)}
                          placeholder="Masalan: 1036054073" 
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Xabar Matni</label>
                        <textarea 
                          rows={3}
                          value={testMessage}
                          onChange={e => setTestMessage(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium"
                        />
                      </div>
                      <button 
                        onClick={handleSendTestTelegram}
                        disabled={sendingTest}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2 text-sm"
                      >
                        <Send className="h-4 w-4" />
                        {sendingTest ? 'Yuborilmoqda...' : 'Test Xabarini Yuborish'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: LOGIN & SECURITY */}
              {activeTab === 'security' && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Login & Xavfsizlik Qoidalari</h2>
                  <p className="text-sm text-slate-500">Tizimga kirish xavfsizligi va 2FA OTP sozlamalari</p>
                  
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Telegram 2FA Ikki Bosqichli Tasdiqlash</h4>
                      <p className="text-xs text-slate-500 mt-1">Kirishda Telegram boti orqali tasdiqlash kodini yuborish</p>
                    </div>
                    <input type="checkbox" className="h-6 w-6 rounded text-indigo-600" defaultChecked />
                  </div>
                </div>
              )}

              {/* TAB 6: COMPANY & BRANCHES */}
              {activeTab === 'company' && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kompaniya & Filiallar</h2>
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kompaniya Nomi</label>
                      <input type="text" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold" defaultValue="Nexo HR Enterprise" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asosiy Til</label>
                      <select className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold">
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

      {/* ENTERPRISE USER EDIT MODAL (Matching User Screenshot) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                FOYDALANUVCHINI TAHRIRLASH (ENTERPRISE)
              </h3>
              <button onClick={() => setEditingUser(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserModal} className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">F.I.Sh (To'liq Ism-Sharifi) *</label>
                  <input 
                    type="text" 
                    value={editingUser.firstName}
                    onChange={e => setEditingUser({...editingUser, firstName: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Elektron Pochta (Email) *</label>
                  <input 
                    type="email" 
                    value={editingUser.email}
                    onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tizim Logini *</label>
                  <input type="text" defaultValue={editingUser.email.split('@')[0]} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Xodim ID (Employee ID) *</label>
                  <input type="text" defaultValue={editingUser.employeeId} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold" />
                </div>
              </div>

              {/* Password Reset Action */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Foydalanuvchi Parolini Yangilash</span>
                <button 
                  type="button"
                  onClick={() => setResetPasswordUserId(editingUser.id)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-amber-600 transition-all flex items-center gap-1.5"
                >
                  <Key className="h-3.5 w-3.5" />
                  Parolni tiklash (Reset)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bo'lim (RBAC)</label>
                  <select 
                    value={editingUser.department} 
                    onChange={e => setEditingUser({...editingUser, department: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  >
                    <option value="Administration">Raqbariyat</option>
                    <option value="HR">HR Bo'limi</option>
                    <option value="Production">Ishlab chiqarish</option>
                    <option value="QC">Sifat Nazorati (QC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lavozim (Position)</label>
                  <input 
                    type="text" 
                    value={editingUser.position} 
                    onChange={e => setEditingUser({...editingUser, position: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Huquq Roli (RBAC)</label>
                  <select 
                    value={editingUser.role} 
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="HR_MANAGER">HR MANAGER</option>
                    <option value="DIRECTOR">DIRECTOR</option>
                    <option value="DEPARTMENT_HEAD">DEPARTMENT HEAD</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tizimda Holati (Status)</label>
                  <select className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold">
                    <option value="ACTIVE">Faol (Active)</option>
                    <option value="DISABLED">Bloklangan (Disabled)</option>
                  </select>
                </div>
              </div>

              {/* Telegram Integration Fields (Matching User Screenshot) */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telegram Integratsiya Sozlamalari</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telegram ID (Raqamli ID)</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: 1036054073" 
                      value={editingUser.telegramId}
                      onChange={e => setEditingUser({...editingUser, telegramId: e.target.value})}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telegram Username (@belgisiz)</label>
                    <input 
                      type="text" 
                      placeholder="Adele_nn" 
                      value={editingUser.telegramUsername}
                      onChange={e => setEditingUser({...editingUser, telegramUsername: e.target.value})}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm"
                >
                  Bekor Qilish
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Ma'lumotlarni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN RESET PASSWORD MODAL */}
      {resetPasswordUserId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" />
              Foydalanuvchi Parolini Tiklash
            </h3>
            <p className="text-xs text-slate-500">
              Ushbu foydalanuvchi uchun yangi parol belgilang.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Yangi Parol *</label>
              <input 
                type="password" 
                value={newPasswordInput}
                onChange={e => setNewPasswordInput(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold" 
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setResetPasswordUserId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Bekor Qilish
              </button>
              <button 
                onClick={() => handleAdminResetPassword(resetPasswordUserId)}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md hover:bg-amber-600"
              >
                {loading ? 'Saqlanmoqda...' : 'Parolni O\'zgartirish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Yangi Foydalanuvchi Yaratish
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ism *</label>
                <input name="firstName" required type="text" className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold" placeholder="Alisher" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Familiya *</label>
                <input name="lastName" required type="text" className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold" placeholder="Valiyev" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email *</label>
                <input name="email" required type="email" className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold" placeholder="alisher@nexo.hr" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Boshlang'ich Parol *</label>
                <input name="password" required type="password" className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol</label>
                <select name="role" className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold">
                  <option value="HR_MANAGER">HR MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="DIRECTOR">DIRECTOR</option>
                  <option value="DEPARTMENT_HEAD">DEPARTMENT HEAD</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Bekor Qilish
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700"
                >
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
