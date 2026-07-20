import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataInitializer } from './DataInitializer';
import { ToastProvider } from '@/contexts/ToastContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
