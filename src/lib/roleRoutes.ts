import type { AppRole } from '@/hooks/useRole';

export function roleHome(role: AppRole): string {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'parent': return '/parent/dashboard';
    case 'student': return '/student/dashboard';
    default: return '/';
  }
}

export function roleLogin(role: Exclude<AppRole, null | 'member'>): string {
  switch (role) {
    case 'admin': return '/admin';
    case 'parent': return '/parent/login';
    case 'student': return '/student/login';
  }
}
