import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStudentCtx } from '@/contexts/StudentContext';
import { StudentProfileCard } from '@/components/portal/StudentProfileCard';
import { FeeSummaryCards } from '@/components/portal/FeeSummaryCards';
import { AttendanceSummary } from '@/components/portal/AttendanceSummary';
import { PortalSkeleton } from '@/components/portal/PortalSkeleton';
import { EmptyState } from '@/components/portal/EmptyState';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserX, Bell, ChevronRight } from 'lucide-react';

export default function StudentDashboard() {
  const { loading, student, classMap, sectionMap } = useStudentCtx();
  const [attendance, setAttendance] = useState<{ status: string }[]>([]);
  const [unread, setUnread] = useState(0);
  const [latest, setLatest] = useState<string | null>(null);

  useEffect(() => {
    if (!student) return;
    (async () => {
      const [{ data: a }, { data: n }, { data: r }] = await Promise.all([
        supabase.from('attendance').select('status').eq('student_id', student.id).order('date', { ascending: false }).limit(60),
        supabase.from('notifications').select('id,title').order('created_at', { ascending: false }).limit(10),
        supabase.from('notification_reads').select('notification_id'),
      ]);
      setAttendance((a ?? []) as any);
      const read = new Set((r ?? []).map((x: any) => x.notification_id));
      setUnread((n ?? []).filter((x: any) => !read.has(x.id)).length);
      setLatest(n?.[0]?.title ?? null);
    })();
  }, [student?.id]);

  if (loading) return <PortalSkeleton />;
  if (!student) {
    return <EmptyState icon={UserX} title="No student record linked" description="Please contact the school office to link your profile." />;
  }
  const pending = Math.max(0, Number(student.total_fees) - Number(student.paid_fees));

  return (
    <>
      <StudentProfileCard
        name={student.name}
        course={student.course}
        admissionNumber={student.admission_number}
        className={student.class_id ? classMap[student.class_id] : null}
        section={student.section_id ? sectionMap[student.section_id] : null}
        imageUrl={student.profile_image_url}
        variant="student"
      />
      <FeeSummaryCards paid={Number(student.paid_fees)} pending={pending} />
      <AttendanceSummary records={attendance} />

      <Link to="/student/notices" className="block">
        <Card className="p-4 flex items-center gap-3 active:bg-muted transition-colors">
          <div className="p-2 rounded-lg bg-indigo-100"><Bell className="h-4 w-4 text-indigo-700" /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">Notices</p>
              {unread > 0 && <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">{unread}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground truncate">{latest ?? 'No notices yet'}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Card>
      </Link>
    </>
  );
}
