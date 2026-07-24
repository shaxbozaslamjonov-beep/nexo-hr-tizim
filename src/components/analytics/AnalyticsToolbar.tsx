import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Filter, Download, Pencil, ChevronDown, FileText, Table, Calendar, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from 'react-hot-toast';
import { exportService } from '@/lib/services/exportService';

interface AnalyticsToolbarProps {
  onEditTimeRange: (range: string) => void;
  onEditPreferences: () => void;
  stats?: { candidates: number; vacancies: number; lessons: number; testResults: number };
}

export function AnalyticsToolbar({ onEditTimeRange, onEditPreferences, stats }: AnalyticsToolbarProps) {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('30days');

  const handleExport = (type: string) => {
    try {
      if (type === 'Excel') {
        const data = [
          { Metric: "Candidates / Nomzodlar", Value: stats?.candidates ?? 0 },
          { Metric: "Vacancies / Vakansiyalar", Value: stats?.vacancies ?? 0 },
          { Metric: "Assigned Lessons / Darslar", Value: stats?.lessons ?? 0 },
          { Metric: "Test Results / Test Natijalari", Value: stats?.testResults ?? 0 },
        ];
        exportService.toExcel(data, `HR_Analytics_${new Date().toISOString().slice(0, 10)}`);
        toast.success(t('toolbar.exportSuccess') || 'Excel fayl yuklab olindi!');
      } else if (type === 'PDF') {
        exportService.toPDF(
          ['Metrika', 'Qiymat'],
          [
            ['Total Candidates / Nomzodlar', stats?.candidates ?? 0],
            ['Total Vacancies / Vakansiyalar', stats?.vacancies ?? 0],
            ['Assigned Lessons / Darslar', stats?.lessons ?? 0],
            ['Test Results / Test Natijalari', stats?.testResults ?? 0],
          ],
          `HR_Analytics_${new Date().toISOString().slice(0, 10)}`,
          'Nexo HR - Analytics Report'
        );
        toast.success(t('toolbar.exportSuccess') || 'PDF fayl yuklab olindi!');
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Eksport qilishda xatolik yuz berdi');
    }
  };

  const handleFilter = (range: string) => {
    setActiveFilter(range);
    onEditTimeRange(range);
    toast.success(`${t('toolbar.filter') || 'Filtr'} applied`);
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.1rem',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      {/* Date Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
            }}
          >
            <Filter size={16} />
            <span>{t('toolbar.filter') || 'Filtr'}</span>
            <ChevronDown size={14} style={{ opacity: 0.7 }} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white rounded-xl shadow-lg border-slate-100 p-1">
          <DropdownMenuLabel className="font-semibold text-slate-500 text-xs uppercase tracking-wider px-2 py-1.5">
            Date Range
          </DropdownMenuLabel>
          <DropdownMenuItem 
            className={`gap-3 rounded-lg cursor-pointer py-2.5 ${activeFilter === '7days' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}
            onClick={() => handleFilter('7days')}
          >
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Last 7 Days</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`gap-3 rounded-lg cursor-pointer py-2.5 ${activeFilter === '30days' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}
            onClick={() => handleFilter('30days')}
          >
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Last 30 Days</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="font-semibold text-slate-500 text-xs uppercase tracking-wider px-2 py-1.5">
            Department
          </DropdownMenuLabel>
          <DropdownMenuItem className="gap-3 rounded-lg cursor-pointer hover:bg-slate-50 py-2.5 text-slate-700 opacity-60" onClick={() => toast('Bo\'lim bo\'yicha filtr tez orada qo\'shiladi', { icon: '🚧' })}>
            <Building2 className="h-4 w-4" />
            <span className="font-medium">IT & Tech</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-3 rounded-lg cursor-pointer hover:bg-slate-50 py-2.5 text-slate-700 opacity-60" onClick={() => toast('Bo\'lim bo\'yicha filtr tez orada qo\'shiladi', { icon: '🚧' })}>
            <Building2 className="h-4 w-4" />
            <span className="font-medium">Sales</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
            }}
          >
            <Download size={16} />
            <span>{t('toolbar.export') || 'Eksport'}</span>
            <ChevronDown size={14} style={{ opacity: 0.7 }} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white rounded-xl shadow-lg border-slate-100 p-1">
          <DropdownMenuItem className="gap-3 rounded-lg cursor-pointer hover:bg-slate-50 py-2.5" onClick={() => handleExport('PDF')}>
            <div className="p-1.5 bg-red-50 rounded-md text-red-600">
              <FileText className="h-4 w-4" />
            </div>
            <span className="font-medium text-slate-700">{t('toolbar.pdfReport') || 'PDF Hisobot'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-3 rounded-lg cursor-pointer hover:bg-slate-50 py-2.5" onClick={() => handleExport('Excel')}>
            <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600">
              <Table className="h-4 w-4" />
            </div>
            <span className="font-medium text-slate-700">{t('toolbar.excelData') || 'Excel Ma\'lumot'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Button */}
      <button 
        onClick={onEditPreferences}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
        }}
      >
        <Pencil size={16} />
        <span>{t('toolbar.edit') || 'Tahrirlash'}</span>
      </button>
    </div>
  );
}

