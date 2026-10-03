'use client';
// /admin — guarded: redirects to /admin/login when not authenticated.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPanel from '@/components/AdminPanel.jsx';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const [ok, setOk] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then((r) => {
      if (r.ok) setOk(true);
      else router.replace('/admin/login');
    }).catch(() => router.replace('/admin/login'));
  }, [router]);

  if (!ok) return <div className="center">Checking login…</div>;
  return <AdminPanel />;
}
