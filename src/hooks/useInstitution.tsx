import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type InstitutionType = 'college' | 'school';

interface InstitutionContextValue {
  institutionType: InstitutionType;
  setInstitutionType: (type: InstitutionType) => void;
}

const InstitutionContext = createContext<InstitutionContextValue | undefined>(undefined);

export function InstitutionProvider({ children }: { children: ReactNode }) {
  const [institutionType, setInstitutionType] = useState<InstitutionType>(() => {
    const stored = localStorage.getItem('institutionType');
    return (stored === 'school' ? 'school' : 'college') as InstitutionType;
  });

  useEffect(() => {
    localStorage.setItem('institutionType', institutionType);
  }, [institutionType]);

  return (
    <InstitutionContext.Provider value={{ institutionType, setInstitutionType }}>
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution() {
  const context = useContext(InstitutionContext);
  if (!context) throw new Error('useInstitution must be used within InstitutionProvider');
  return context;
}
