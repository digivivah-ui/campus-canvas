import { supabase } from '@/integrations/supabase/client';

export type NotifyAudience = 'all' | 'admin' | 'teacher' | 'parent' | 'student';
export type NotifyType = 'general' | 'fee' | 'result' | 'attendance' | 'homework' | 'notice' | 'event';

export interface NotifyInput {
  type: NotifyType;
  title: string;
  body?: string;
  audience?: NotifyAudience;
  link?: string;
}

/**
 * Single entry point for outbound notifications.
 * Future fee/result/attendance alerts should call this — keeps history in one table.
 */
export async function notify({ type, title, body, audience = 'all', link }: NotifyInput) {
  const payload: any = {
    title,
    body: body ?? null,
    category: type,
    audience,
    link: link ?? null,
    created_at: new Date().toISOString(),
  };
  const { error } = await (supabase as any).from('notifications').insert([payload]);
  if (error) throw error;
}
