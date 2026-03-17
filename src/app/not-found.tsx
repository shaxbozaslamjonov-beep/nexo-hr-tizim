'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        padding: '3rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <AlertCircle size={40} color="#ef4444" />
        </div>

        <h1 style={{
          color: 'white',
          fontSize: '4rem',
          fontWeight: 900,
          margin: '0 0 1rem',
          letterSpacing: '-0.05em',
          background: 'linear-gradient(to bottom, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>404</h1>

        <h2 style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>{t('errorPageNotFound') || 'Page Not Found'}</h2>

        <p style={{
          color: '#94a3b8',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '2.5rem'
        }}>
          {t('errorPageDescription') || "Sorry, the page you're looking for doesn't exist or has been moved."}
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Link href="/dashboard/hr" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: 'white',
            color: '#0f172a',
            borderRadius: '1rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'transform 0.2s',
          }}>
            <Home size={18} />
            Back to Dashboard
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: 'transparent',
              color: 'white',
              borderRadius: '1rem',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
