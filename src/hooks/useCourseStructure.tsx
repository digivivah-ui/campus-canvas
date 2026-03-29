import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Course = { id: string; name: string; description: string | null; is_active: boolean; created_at: string };
export type Year = { id: string; name: string; course_id: string; is_active: boolean; created_at: string };
export type Semester = { id: string; name: string; year_id: string; is_active: boolean; created_at: string };

export function useCourseStructure() {
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*').order('name');
      if (error) throw error;
      return data as Course[];
    },
  });

  const { data: years = [] } = useQuery<Year[]>({
    queryKey: ['years'],
    queryFn: async () => {
      const { data, error } = await supabase.from('years').select('*').order('name');
      if (error) throw error;
      return data as Year[];
    },
  });

  const { data: semesters = [] } = useQuery<Semester[]>({
    queryKey: ['semesters'],
    queryFn: async () => {
      const { data, error } = await supabase.from('semesters').select('*').order('name');
      if (error) throw error;
      return data as Semester[];
    },
  });

  const activeCourses = courses.filter(c => c.is_active);
  const getYearsForCourse = (courseId: string) => years.filter(y => y.course_id === courseId && y.is_active);
  const getSemestersForYear = (yearId: string) => semesters.filter(s => s.year_id === yearId && s.is_active);
  const getCourseName = (courseId: string | null) => courses.find(c => c.id === courseId)?.name || '-';
  const getYearName = (yearId: string | null) => years.find(y => y.id === yearId)?.name || '-';
  const getSemesterName = (semesterId: string | null) => semesters.find(s => s.id === semesterId)?.name || '-';

  return { courses, years, semesters, activeCourses, getYearsForCourse, getSemestersForYear, getCourseName, getYearName, getSemesterName };
}
