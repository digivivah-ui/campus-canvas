import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  [key: string]: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  getSetting: (key: string, fallback?: string) => string;
  refetch: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: {},
  isLoading: true,
  getSetting: () => '',
  refetch: () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = () => {
    supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .then(({ data, error }) => {
        if (!error && data) {
          const map: SiteSettings = {};
          data.forEach((row: any) => {
            map[row.setting_key] = row.setting_value || '';
          });
          setSettings(map);
        }
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getSetting = (key: string, fallback = '') => settings[key] || fallback;

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading, getSetting, refetch: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
