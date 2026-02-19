import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SocialLink {
  id: string;
  platform_name: string;
  url: string | null;
  icon: string | null;
  is_active: boolean | null;
}

export function useSocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('social_links')
      .select('*')
      .eq('is_active', true)
      .order('order_index')
      .then(({ data, error }) => {
        if (!error && data) {
          setLinks((data as SocialLink[]).filter(l => l.url && l.url.trim() !== ''));
        }
        setIsLoading(false);
      });
  }, []);

  return { links, isLoading };
}
