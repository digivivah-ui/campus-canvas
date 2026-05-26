import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParentCtx } from '@/contexts/ParentContext';
import { AttendanceSummary } from '@/components/portal/AttendanceSummary';
import { AttendanceList } from '@/components/portal/AttendanceList';
import { EmptyState } from '@/components/portal/EmptyState';
import { PortalSkeleton } from '@/components/portal/PortalSkeleton';
import { CalendarCheck } from 'lucide-react';

interface Att { id: string; date: string; status: string; remarks?: string | null }

export default function ParentAttendance() {
  const { loading, selected } = useParentCtx();
  const [records, setRecords] = useState<Att[]>([]);

  useEffect(() => {
    if (!selected) return;
    supabase.from('attendance').select('id,date,status,remarks').eq('student_id', selected.id).order('date', { ascending: false }).limit(90)
      .then(({ data }) => setRecords((data ?? []) as Att[]));
  }, [selected?.id]);

  if (loading) return <PortalSkeleton />;
  if (!selected) return null;

  return (
    <>
      <AttendanceSummary records={records} />
      <h3 className="font-semibold text-sm px-1">Recent Days</h3>
      {records.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No attendance yet" description="Daily attendance will appear here." />
      ) : (
        <AttendanceList records={records} />
      )}
    </>
  );
}
