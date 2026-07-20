'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { springSnappy } from '@/lib/motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function SupportChatWidget() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;
    setInput('');
    const next: Message[] = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={springSnappy}
            style={{
              width: '340px',
              height: '440px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              boxShadow: '0 20px 50px -10px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1rem',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1rem 1.25rem', background: 'var(--grad-primary)', color: 'white', fontWeight: 700 }}>
              {t('supportChat.title')}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.length === 0 && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{t('supportChat.emptyHint')}</div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-muted)',
                    color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                  <Loader2 size={14} /> {t('supportChat.thinking')}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={t('supportChat.placeholder')}
                style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '0.85rem' }}
              />
              <button
                onClick={send}
                disabled={loading}
                style={{ width: 36, height: 36, borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--grad-primary)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 30px -8px rgba(99,102,241,0.5)',
          marginLeft: 'auto',
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </div>
  );
}
