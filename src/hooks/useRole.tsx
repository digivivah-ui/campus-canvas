import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AppRole = 'admin' | 'parent' | 'student' | 'member' | null;

export function useRole() {
  const { user, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    if (!user) { setRole(null); setLoading(false); return; }
    setLoading(true);
    supabase.from('user_roles').select('role').eq('user_id', user.id).then(({ data }) => {
      if (cancelled) return;
      const roles = (data ?? []).map((r: any) => r.role);
      const priority: AppRole[] = ['admin', 'parent', 'student', 'member'];
      const found = priority.find(p => p && roles.includes(p)) ?? null;
      setRole(found);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user, authLoading]);

  return { role, loading: loading || authLoading, user };
}
