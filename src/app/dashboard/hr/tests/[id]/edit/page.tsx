'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowLeft, Plus, Save, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm, useFieldArray } from 'react-hook-form';

type QuestionFormType = {
  id?: string;
  text: string;
  type: string;
  options: string[];
  correctIdx: number[];
};

export default function TestEditPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [testActive, setTestActive] = useState(true);
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');

  const { register, control, handleSubmit, reset } = useForm<{ questions: QuestionFormType[] }>({
    defaultValues: { questions: [] }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'questions'
  });

  useEffect(() => {
    fetchTestDetails();
  }, []);

  const fetchTestDetails = async () => {
    try {
      const res = await fetch(`/api/tests/${params.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTestTitle(data.title);
      setTestDescription(data.description || '');
      setTestActive(data.isActive ?? true);
      
      const formattedQs = data.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: JSON.parse(q.options || '[]'),
        correctIdx: JSON.parse(q.correctIdx || '[]')
      }));
      reset({ questions: formattedQs });
    } catch (e) {
      toast.error('Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async (data: { questions: QuestionFormType[] }) => {
    try {
      // 1. Update Test details
      await fetch(`/api/tests/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: testTitle,
          description: testDescription,
          isActive: testActive
        })
      });

      // 2. We can handle questions one by one for simplicity in this task
      // In reality, a bulk update API would be better.
      for (const q of data.questions) {
        if (!q.id) {
          await fetch(`/api/tests/${params.id}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q)
          });
        } else {
          await fetch(`/api/tests/${params.id}/questions/${q.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q)
          });
        }
      }
      
      toast.success('Test saved successfully');
      router.push('/dashboard/hr/tests');
    } catch (e) {
      toast.error('Error saving test');
    }
  };

  const deleteQuestion = async (index: number, questionId?: string) => {
    if (questionId) {
      if (!confirm('Delete this question permanently?')) return;
      try {
        const res = await fetch(`/api/tests/${params.id}/questions/${questionId}`, { method: 'DELETE' });
        if (res.ok) {
          remove(index);
          toast.success('Question deleted');
        }
      } catch (e) {
        toast.error('Failed to delete');
      }
    } else {
      remove(index);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Tests
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Edit Test</h1>
        <button onClick={handleSubmit(handleSaveAll)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>Test Details</h2>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Title</label>
            <input type="text" value={testTitle} onChange={e => setTestTitle(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Description</label>
            <textarea value={testDescription} onChange={e => setTestDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
              <input type="checkbox" checked={testActive} onChange={e => setTestActive(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              Active Status
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Questions Management</h2>
        <button type="button" onClick={() => append({ text: '', type: 'single', options: ['', ''], correctIdx: [0] })} style={{ padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Add Question
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {fields.map((field, index) => (
          <div key={field.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative' }}>
            <button type="button" onClick={() => deleteQuestion(index, field.id)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#fef2f2', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
              <Trash2 size={16} />
            </button>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b', marginBottom: '1rem' }}>Question {index + 1}</h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <input {...register(`questions.${index}.text` as const, { required: true })} placeholder="Question text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
              </div>
              
              <div>
                <select {...register(`questions.${index}.type` as const)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                  <option value="single">Single Choice</option>
                  <option value="multiple">Multiple Choice</option>
                </select>
              </div>

              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Options (Comma separated for demo syntax) - Example: A, B, C</p>
                <input 
                  type="text" 
                  defaultValue={field.options.join(', ')} 
                  onChange={(e) => {
                    const opts = e.target.value.split(',').map(s => s.trim());
                    update(index, { ...field, options: opts });
                  }} 
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
                />
              </div>

              <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14} /> Correct Index (e.g. 0 for first option)</p>
                <input 
                  type="text" 
                  placeholder="0 or 0,1"
                  defaultValue={field.correctIdx.join(',')} 
                  onChange={(e) => {
                    const idxs = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                    update(index, { ...field, correctIdx: idxs });
                  }} 
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #86efac', outline: 'none' }} 
                />
              </div>
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
            No questions added yet. Click "Add Question" to start.
          </div>
        )}
      </div>
    </div>
  );
}
