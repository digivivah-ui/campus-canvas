import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRole, AppRole } from '@/hooks/useRole';
import { PageLoader } from '@/components/common/LoadingSpinner';

interface Props {
  role: Exclude<AppRole, null | 'member'>;
  loginPath: string;
  children: ReactNode;
}

export function RequireRole({ role, loginPath, children }: Props) {
  const { role: currentRole, user, loading } = useRole();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to={loginPath} replace />;
  if (currentRole !== role && currentRole !== 'admin') return <Navigate to={loginPath} replace />;
  return <>{children}</>;
}
