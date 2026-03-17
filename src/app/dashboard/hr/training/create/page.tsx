'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trainingService } from '@/lib/services/trainingService';
import { TrainingPath, TrainingStage, TrainingTask } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Video,
  FileText,
  Award,
  FileEdit,
  GripVertical
} from 'lucide-react';
import Link from 'next/link';
import styles from './create-path.module.css';
import toast from 'react-hot-toast';

export default function CreateTrainingPathPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
  });

  const [stages, setStages] = useState<TrainingStage[]>([
    {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Introduction',
      description: 'Basics and orientation',
      order: 1,
      estimatedHours: 1,
      tasks: []
    }
  ]);

  const addStage = () => {
    setStages([...stages, {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Stage',
      description: '',
      order: stages.length + 1,
      estimatedHours: 1,
      tasks: []
    }]);
  };

  const addTask = (stageId: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          tasks: [...s.tasks, {
            id: Math.random().toString(36).substr(2, 9),
            title: 'New Task',
            description: '',
            type: 'video',
            required: true,
            estimatedMinutes: 15
          }]
        } as TrainingStage;
      }
      return s;
    }));
  };

  const handleSave = async () => {
    if (!form.title) {
      toast.error('Title is required');
      return;
    }

    try {
      await trainingService.createPath({
        ...form,
        stages,
        assignedTo: [],
        status: 'active',
        createdBy: '1'
      });
      toast.success('Training path created!');
      router.push('/dashboard/hr/training');
    } catch (e) {
      toast.error('Failed to create path');
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard/hr/training" className={styles.backBtn}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className={styles.pageTitle}>{t('training.createNew')}</h1>
        </div>
        <div className={styles.wizardSteps}>
           <div className={`${styles.wizardStep} ${step >= 1 ? styles.active : ''}`}>1</div>
           <div className={styles.wizardLine} />
           <div className={`${styles.wizardStep} ${step >= 2 ? styles.active : ''}`}>2</div>
        </div>
      </div>

      <div className={styles.card}>
        {step === 1 ? (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>General Information</h2>
            <div className={styles.formGroup}>
              <label>Title *</label>
              <input 
                type="text" 
                className={styles.input} 
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea 
                className={styles.textarea} 
                rows={4}
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Describe what this path covers..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>Thumbnail URL</label>
              <input 
                type="text" 
                className={styles.input}
                value={form.thumbnail}
                onChange={e => setForm({...form, thumbnail: e.target.value})}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <div className={styles.footer}>
              <button disabled className={styles.navBtn}>
                 <ChevronLeft size={20} /> Preview
              </button>
              <button onClick={() => setStep(2)} className={`${styles.navBtn} ${styles.navBtnPrimary}`}>
                 Next Step <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Path Structure & Stages</h2>
              <button onClick={addStage} className={styles.addBtn}>
                 <Plus size={18} /> {t('training.addStage')}
              </button>
            </div>

            <div className={styles.stagesContainer}>
              {stages.map((stage, sIdx) => (
                <div key={stage.id} className={styles.stageEditor}>
                   <div className={styles.stageEditorHeader}>
                      <GripVertical size={20} className={styles.dragHandle} />
                      <input 
                        className={styles.stageTitleInput}
                        value={stage.title}
                        onChange={e => {
                          const newStages = [...stages];
                          newStages[sIdx].title = e.target.value;
                          setStages(newStages);
                        }}
                      />
                      <button onClick={() => setStages(stages.filter(s => s.id !== stage.id))} className={styles.iconBtnDanger}>
                        <Trash2 size={16} />
                      </button>
                   </div>
                   
                   <div className={styles.tasksEditor}>
                      {stage.tasks.map((task, tIdx) => (
                        <div key={task.id} className={styles.taskEditorItem}>
                           <select 
                            value={task.type}
                            onChange={e => {
                              const newStages = [...stages];
                              newStages[sIdx].tasks[tIdx].type = e.target.value as any;
                              setStages(newStages);
                            }}
                           >
                             <option value="video">Video</option>
                             <option value="article">Article</option>
                             <option value="quiz">Quiz</option>
                             <option value="assignment">Task</option>
                           </select>
                           <input 
                            value={task.title}
                            placeholder="Task title"
                            onChange={e => {
                              const newStages = [...stages];
                              newStages[sIdx].tasks[tIdx].title = e.target.value;
                              setStages(newStages);
                            }}
                           />
                           <button onClick={() => {
                              const newStages = [...stages];
                              newStages[sIdx].tasks = newStages[sIdx].tasks.filter(t => t.id !== task.id);
                              setStages(newStages);
                           }} className={styles.minimalDelete}>&times;</button>
                        </div>
                      ))}
                      <button onClick={() => addTask(stage.id)} className={styles.addTaskBtn}>
                        <Plus size={14} /> {t('training.addTask')}
                      </button>
                   </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <button onClick={() => setStep(1)} className={styles.navBtn}>
                 <ChevronLeft size={20} /> Back
              </button>
              <button onClick={handleSave} className={`${styles.navBtn} ${styles.navBtnPrimary}`}>
                 <Save size={18} /> Save Path
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
