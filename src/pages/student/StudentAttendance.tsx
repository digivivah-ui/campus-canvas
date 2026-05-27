import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStudentCtx } from '@/contexts/StudentContext';
import { AttendanceSummary } from '@/components/portal/AttendanceSummary';
import { AttendanceCalendar } from '@/components/portal/AttendanceCalendar';
import { AttendanceList } from '@/components/portal/AttendanceList';
import { EmptyState } from '@/components/portal/EmptyState';
import { PortalSkeleton } from '@/components/portal/PortalSkeleton';
import { CalendarCheck } from 'lucide-react';

interface Att { id: string; date: string; status: string; remarks?: string | null }

export default function StudentAttendance() {
  const { loading, student } = useStudentCtx();
  const [records, setRecords] = useState<Att[]>([]);

  useEffect(() => {
    if (!student) return;
    supabase.from('attendance').select('id,date,status,remarks').eq('student_id', student.id).order('date', { ascending: false }).limit(180)
      .then(({ data }) => setRecords((data ?? []) as Att[]));
  }, [student?.id]);

  if (loading) return <PortalSkeleton />;
  if (!student) return null;

  return (
    <>
      <AttendanceSummary records={records} />
      <AttendanceCalendar records={records} />
      <h3 className="font-semibold text-sm px-1">Recent Days</h3>
      {records.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No attendance recorded" description="Your attendance will appear here daily." />
      ) : (
        <AttendanceList records={records.slice(0, 20)} />
      )}
    </>
  );
}
