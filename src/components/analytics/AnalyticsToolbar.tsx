import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
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

interface AnalyticsToolbarProps {
  onEditTimeRange: (range: string) => void;
  onEditPreferences: () => void;
}

export function AnalyticsToolbar({ onEditTimeRange, onEditPreferences }: AnalyticsToolbarProps) {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('30days');

  const handleExport = (type: string) => {
    toast(`${t('toolbar.export') || 'Eksport'}: ${type} export functionality coming soon`, { icon: 'ℹ️' });
  };

  const handleFilter = (range: string) => {
    setActiveFilter(range);
    onEditTimeRange(range);
    toast.success(`${t('toolbar.filter') || 'Filtr'} applied`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-md gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 w-full sm:w-auto font-medium group"
          >
            <Filter className="h-4 w-4" />
            {t('toolbar.filter') || 'Filtr'}
            <ChevronDown className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Button>
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
          <DropdownMenuItem className="gap-3 rounded-lg cursor-pointer hover:bg-slate-50 py-2.5 text-slate-700" onClick={() => handleFilter('dept-it')}>
            <Building2 className="h-4 w-4" />
            <span className="font-medium">IT & Tech</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-3 rounded-lg cursor-pointer hover:bg-slate-50 py-2.5 text-slate-700" onClick={() => handleFilter('dept-sales')}>
            <Building2 className="h-4 w-4" />
            <span className="font-medium">Sales</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-md gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 w-full sm:w-auto font-medium group"
          >
            <Download className="h-4 w-4" />
            {t('toolbar.export') || 'Eksport'}
            <ChevronDown className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Button>
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

      <Button 
        variant="outline" 
        size="sm" 
        onClick={onEditPreferences}
        className="rounded-md gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 w-full sm:w-auto font-medium"
      >
        <Pencil className="h-4 w-4" />
        {t('toolbar.edit') || 'Tahrirlash'}
      </Button>
    </div>
  );
}
