'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, ShieldAlert, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TaskKanbanBoard } from '@/components/ai-assistant/TaskKanbanBoard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AiAssistantContent() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [monitorReport, setMonitorReport] = useState<string | null>(null);
  const [monitorLoading, setMonitorLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;
    setError('');
    setInput('');
    const nextMessages: Message[] = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runMonitor = async () => {
    setMonitorLoading(true);
    setMonitorReport(null);
    try {
      const res = await fetch('/api/ai/monitor', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMonitorReport(data.report);
    } catch (e: any) {
      setMonitorReport(`⚠️ ${e.message}`);
    } finally {
      setMonitorLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', display: 'flex', flexDirection: 'column', height: '70vh' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{t('aiAssistant.title')}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('aiAssistant.subtitle')}</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.length === 0 && (
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{t('aiAssistant.emptyHint')}</div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-muted)',
                color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 size={16} className="animate-pulse-slow" /> {t('aiAssistant.thinking')}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <div style={{ padding: '0.5rem 1.5rem', color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>}

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={t('aiAssistant.placeholder')}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--background)' }}
          />
          <button
            onClick={send}
            disabled={loading}
            style={{ width: 44, height: 44, borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <ShieldAlert size={20} color="var(--warning)" />
          <div style={{ fontWeight: 700 }}>{t('aiAssistant.monitorTitle')}</div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {t('aiAssistant.monitorDesc')}
        </p>
        <button
          onClick={runMonitor}
          disabled={monitorLoading}
          style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: 'none', background: 'var(--warning)', color: 'white', fontWeight: 700, cursor: 'pointer', marginBottom: '1rem' }}
        >
          {monitorLoading ? t('aiAssistant.checking') : t('aiAssistant.runCheck')}
        </button>
        {monitorReport && (
          <div style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: 1.6, background: 'var(--bg-muted)', borderRadius: '12px', padding: '1rem' }}>
            {monitorReport}
          </div>
        )}
      </div>
    </div>

    <TaskKanbanBoard />
    </div>
  );
}
