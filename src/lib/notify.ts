import { supabase } from '@/integrations/supabase/client';

export type NotifyTargetType = 'all' | 'class' | 'section' | 'student';
export type NotifyCategory = 'general' | 'fee' | 'result' | 'attendance' | 'homework' | 'notice' | 'event';

export interface NotifyInput {
  title: string;
  message: string;
  target_type?: NotifyTargetType;
  class_id?: string | null;
  section_id?: string | null;
  student_id?: string | null;
  /** Free-form category tag — encoded into the title as a [tag] prefix when present. */
  category?: NotifyCategory;
}

/**
 * Single entry point for outbound notifications. Future fee/result/attendance
 * alerts should call this — keeps history in one table.
 */
export async function notify(input: NotifyInput) {
  const title = input.category && input.category !== 'general'
    ? `[${input.category.toUpperCase()}] ${input.title}`
    : input.title;
  const payload = {
    title,
    message: input.message,
    target_type: input.target_type ?? 'all',
    class_id: input.class_id ?? null,
    section_id: input.section_id ?? null,
    student_id: input.student_id ?? null,
  };
  const { error } = await (supabase as any).from('notifications').insert([payload]);
  if (error) throw error;
}
