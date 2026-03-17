import React, { useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Settings2 } from 'lucide-react';

export interface AnalyticsPreferences {
  targets: {
    candidatesTarget: number;
    vacanciesTarget: number;
    lessonsTarget: number;
    testResultsTarget: number;
  };
}

interface AnalyticsEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPreferences: AnalyticsPreferences;
  onSave: (preferences: AnalyticsPreferences) => void;
}

export function AnalyticsEditModal({ 
  open, 
  onOpenChange, 
  currentPreferences,
  onSave
}: AnalyticsEditModalProps) {
  const { t } = useLanguage();
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: currentPreferences
  });

  // Reset form when opened with new preferences
  useEffect(() => {
    if (open) {
      reset(currentPreferences);
    }
  }, [open, currentPreferences, reset]);

  const onSubmit = (data: { targets: { candidatesTarget: string | number, vacanciesTarget: string | number, lessonsTarget: string | number, testResultsTarget: string | number } }) => {
    onSave({
      targets: {
        candidatesTarget: Number(data.targets.candidatesTarget),
        vacanciesTarget: Number(data.targets.vacanciesTarget),
        lessonsTarget: Number(data.targets.lessonsTarget),
        testResultsTarget: Number(data.targets.testResultsTarget),
      }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            {t('settings.title')}
          </DialogTitle>
          <DialogDescription>
            {t('careerMaps.stats.target') || 'Dashboard maqsadli ko\'rsatkichlarini sozlash'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none">{t('careerMaps.stats.target') || 'Maqsadlar (Targets)'}</h4>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="candidatesTarget" className="text-right col-span-2">
                {t('candidates.title')} Target
              </Label>
              <Input
                id="candidatesTarget"
                type="number"
                className="col-span-2"
                {...register('targets.candidatesTarget')}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vacanciesTarget" className="text-right col-span-2">
                {t('vacancies.title')} Target
              </Label>
              <Input
                id="vacanciesTarget"
                type="number"
                className="col-span-2"
                {...register('targets.vacanciesTarget')}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lessonsTarget" className="text-right col-span-2">
                {t('lessons')} Target
              </Label>
              <Input
                id="lessonsTarget"
                type="number"
                className="col-span-2"
                {...register('targets.lessonsTarget')}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="testResultsTarget" className="text-right col-span-2">
                {t('tests.results') || 'Test Natijalari'} Target
              </Label>
              <Input
                id="testResultsTarget"
                type="number"
                className="col-span-2"
                {...register('targets.testResultsTarget')}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
