'use client';

import { useState } from 'react';

export function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage({ type: 'success', text: 'Parol muvaffaqiyatli yangilandi' });
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Parolni almashtirish</h2>
      {message && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.875rem', background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: message.type === 'success' ? '#059669' : '#dc2626' }}>
          {message.text}
        </div>
      )}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Joriy parol</label>
        <input
          type="password"
          required
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)' }}
        />
      </div>
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Yangi parol (kamida 6 belgi)</label>
        <input
          type="password"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)' }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
      >
        {loading ? 'Saqlanmoqda...' : 'Saqlash'}
      </button>
    </form>
  );
}
