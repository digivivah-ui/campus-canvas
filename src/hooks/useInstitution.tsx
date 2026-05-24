// Deprecated: system is now school-only. Kept as a no-op shim for any lingering imports.
import { ReactNode } from 'react';

export function InstitutionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useInstitution() {
  return { institutionType: 'school' as const, setInstitutionType: (_: 'school') => {} };
}
