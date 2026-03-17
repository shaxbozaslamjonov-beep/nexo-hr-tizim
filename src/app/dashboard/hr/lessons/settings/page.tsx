'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LessonSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/hr/settings');
  }, [router]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Redirecting...</h1>
      </div>
    </div>
  );
}
