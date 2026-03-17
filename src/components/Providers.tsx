import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataInitializer } from './DataInitializer';
import { ToastProvider } from '@/contexts/ToastContext';
import { SearchProvider } from '@/contexts/SearchContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <SearchProvider>
          <LanguageProvider>
            <DataInitializer />
            {children}
          </LanguageProvider>
        </SearchProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
