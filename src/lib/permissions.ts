import type { AppRole } from '@/hooks/useRole';

/**
 * Centralized permission matrix. Future phases will add UI gating.
 * For now this is the single source of truth for what each role *can* do.
 */
export type Action =
  | 'students.read' | 'students.write'
  | 'staff.read' | 'staff.write'
  | 'attendance.read' | 'attendance.write'
  | 'finance.read' | 'finance.write'
  | 'results.read' | 'results.write'
  | 'inquiries.read' | 'inquiries.write'
  | 'visitors.read' | 'visitors.write'
  | 'certificates.read' | 'certificates.write'
  | 'notifications.read' | 'notifications.write'
  | 'settings.write';

const ADMIN_ALL: Action[] = [
  'students.read','students.write','staff.read','staff.write',
  'attendance.read','attendance.write','finance.read','finance.write',
  'results.read','results.write','inquiries.read','inquiries.write',
  'visitors.read','visitors.write','certificates.read','certificates.write',
  'notifications.read','notifications.write','settings.write',
];

const PRINCIPAL: Action[] = [
  'students.read','staff.read','attendance.read','attendance.write',
  'finance.read','results.read','results.write','inquiries.read',
  'visitors.read','certificates.read','notifications.read','notifications.write',
];

const ACCOUNTANT: Action[] = [
  'students.read','finance.read','finance.write','notifications.read',
];

const TEACHER: Action[] = [
  'students.read','attendance.read','attendance.write',
  'results.read','results.write','notifications.read',
];

const PARENT: Action[] = ['attendance.read','finance.read','results.read','notifications.read'];
const STUDENT: Action[] = ['attendance.read','finance.read','results.read','notifications.read'];

export const PERMISSIONS: Record<Exclude<AppRole, null | 'member'> | 'principal' | 'accountant', Action[]> = {
  admin: ADMIN_ALL,
  principal: PRINCIPAL,
  accountant: ACCOUNTANT,
  teacher: TEACHER,
  parent: PARENT,
  student: STUDENT,
};

export function can(role: AppRole | 'principal' | 'accountant' | null, action: Action): boolean {
  if (!role || role === 'member') return false;
  return (PERMISSIONS[role as keyof typeof PERMISSIONS] ?? []).includes(action);
}
