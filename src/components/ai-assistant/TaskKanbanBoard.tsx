'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Paperclip, X, ChevronLeft, ChevronRight, Trash2, ListChecks } from 'lucide-react';

interface AiTask {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
}

const COLUMNS: { id: AiTask['status']; label: string; color: string }[] = [
  { id: 'TODO', label: 'Bajarilishi kerak', color: 'var(--text-secondary)' },
  { id: 'IN_PROGRESS', label: 'Jarayonda', color: 'var(--amber-500)' },
  { id: 'DONE', label: 'Bajarildi', color: 'var(--emerald-500)' },
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function TaskKanbanBoard() {
  const [tasks, setTasks] = useState<AiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/ai/tasks');
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleFile = (file: File | undefined | null) => {
    setFileError('');
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Fayl hajmi 2 MB dan oshmasligi kerak');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileUrl(reader.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFileName('');
    setFileUrl('');
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreate = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ai/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, fileUrl, fileName }),
      });
      if (res.ok) {
        const created = await res.json();
        setTasks((prev) => [created, ...prev]);
        resetForm();
        setShowForm(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const moveTask = async (task: AiTask, direction: -1 | 1) => {
    const idx = COLUMNS.findIndex((c) => c.id === task.status);
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= COLUMNS.length) return;
    const nextStatus = COLUMNS[nextIdx].id;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    await fetch(`/api/ai/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/ai/tasks/${id}`, { method: 'DELETE' });
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    boxShadow: 'var(--card-shadow)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.85rem',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ ...cardStyle, padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'var(--blue-50)', display: 'flex' }}>
            <ListChecks size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Vazifalar taxtasi</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI yordamchi shu vazifalardan xabardor</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
        >
          <Plus size={15} /> Yangi vazifa
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem', borderRadius: '14px', background: 'var(--bg-muted)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <input placeholder="Vazifa nomi" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          <textarea
            placeholder="Tavsif (ixtiyoriy)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
          />
          {fileName ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>📎 {fileName}</span>
              <button type="button" onClick={() => { setFileName(''); setFileUrl(''); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px dashed var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', width: 'fit-content' }}
            >
              <Paperclip size={13} /> Fayl biriktirish
            </button>
          )}
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
          {fileError && <span style={{ fontSize: '0.75rem', color: 'var(--error)' }}>{fileError}</span>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!title.trim() || submitting}
              style={{ padding: '0.55rem 1rem', borderRadius: '9px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: title.trim() ? 'pointer' : 'not-allowed', opacity: title.trim() ? 1 : 0.5 }}
            >
              {submitting ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm(); }}
              style={{ padding: '0.55rem 1rem', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Bekor
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '160px', borderRadius: '14px', background: 'var(--bg-muted)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} style={{ background: 'var(--bg-muted)', borderRadius: '16px', border: '1px solid var(--border)', padding: '0.85rem', minHeight: '140px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: col.color }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>{col.label}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)' }}>({colTasks.length})</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {colTasks.length === 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', padding: '0.5rem 0' }}>Bo'sh</div>
                  )}
                  {colTasks.map((task) => (
                    <div key={task.id} style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', padding: '0.75rem', boxShadow: 'var(--card-shadow)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: task.description ? '0.3rem' : 0 }}>{task.title}</div>
                      {task.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>{task.description}</div>
                      )}
                      {task.fileUrl && (
                        <a href={task.fileUrl} download={task.fileName || undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', marginBottom: '0.5rem' }}>
                          <Paperclip size={11} /> {task.fileName || 'Fayl'}
                        </a>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            type="button"
                            disabled={col.id === 'TODO'}
                            onClick={() => moveTask(task, -1)}
                            style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: col.id === 'TODO' ? 'not-allowed' : 'pointer', opacity: col.id === 'TODO' ? 0.35 : 1 }}
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={col.id === 'DONE'}
                            onClick={() => moveTask(task, 1)}
                            style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: col.id === 'DONE' ? 'not-allowed' : 'pointer', opacity: col.id === 'DONE' ? 0.35 : 1 }}
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          style={{ border: 'none', background: 'transparent', color: 'var(--text-light)', cursor: 'pointer', display: 'flex' }}
                          title="O'chirish"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
