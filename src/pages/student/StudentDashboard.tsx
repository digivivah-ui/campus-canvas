import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PortalLayout } from '@/layouts/PortalLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotificationsList } from '@/components/portal/NotificationsList';
import { IndianRupee, CalendarCheck, User } from 'lucide-react';
import { PageLoader } from '@/components/common/LoadingSpinner';

interface Student {
  id: string; name: string; admission_number: string | null; course: string;
  total_fees: number; paid_fees: number; profile_image_url: string | null;
  class_id: string | null; section_id: string | null;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<{ status: string }[]>([]);
  const [classMap, setClassMap] = useState<Record<string, string>>({});
  const [sectionMap, setSectionMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: s } = await supabase.from('students').select('*').eq('auth_user_id', user.id).maybeSingle();
      setStudent(s as Student | null);
      if (s) {
        const { data: a } = await supabase.from('attendance').select('status').eq('student_id', s.id).order('date', { ascending: false }).limit(60);
        setAttendance((a ?? []) as any);
      }
      const [{ data: cls }, { data: secs }] = await Promise.all([
        supabase.from('classes').select('id,name'),
        supabase.from('sections').select('id,name'),
      ]);
      setClassMap(Object.fromEntries((cls ?? []).map((c: any) => [c.id, c.name])));
      setSectionMap(Object.fromEntries((secs ?? []).map((s: any) => [s.id, s.name])));
      setLoading(false);
    })();
  }, [user]);

  const stats = useMemo(() => {
    const total = attendance.length || 1;
    const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    return { present, absent: attendance.filter(a => a.status === 'absent').length, pct: Math.round((present / total) * 100), count: attendance.length };
  }, [attendance]);

  if (loading) return <PageLoader />;
  if (!user) return null;

  const pending = student ? Math.max(0, Number(student.total_fees) - Number(student.paid_fees)) : 0;

  return (
    <PortalLayout title="Student Portal" subtitle={student?.name ?? 'Welcome'} loginPath="/student/login">
      {!student ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground">No student record linked to this account.</p></Card>
      ) : (
        <>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
                {student.profile_image_url ? <img src={student.profile_image_url} alt="" className="h-full w-full object-cover" /> : <User className="h-7 w-7 text-accent-foreground" />}
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-semibold truncate">{student.name}</h2>
                <p className="text-sm text-muted-foreground">{student.course}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {student.admission_number && <Badge variant="secondary">{student.admission_number}</Badge>}
                  {student.class_id && classMap[student.class_id] && <Badge variant="outline">Class {classMap[student.class_id]}</Badge>}
                  {student.section_id && sectionMap[student.section_id] && <Badge variant="outline">Sec {sectionMap[student.section_id]}</Badge>}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs"><IndianRupee className="h-3.5 w-3.5" />Paid</div>
              <p className="text-xl font-bold mt-1">₹{Number(student.paid_fees).toLocaleString('en-IN')}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs"><IndianRupee className="h-3.5 w-3.5" />Pending</div>
              <p className={`text-xl font-bold mt-1 ${pending > 0 ? 'text-destructive' : ''}`}>₹{pending.toLocaleString('en-IN')}</p>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3"><CalendarCheck className="h-4 w-4 text-primary" /><h3 className="font-semibold">Attendance ({stats.count} days)</h3></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-green-500/10"><p className="text-lg font-bold text-green-600">{stats.present}</p><p className="text-xs text-muted-foreground">Present</p></div>
              <div className="p-2 rounded-lg bg-destructive/10"><p className="text-lg font-bold text-destructive">{stats.absent}</p><p className="text-xs text-muted-foreground">Absent</p></div>
              <div className="p-2 rounded-lg bg-primary/10"><p className="text-lg font-bold text-primary">{stats.pct}%</p><p className="text-xs text-muted-foreground">Rate</p></div>
            </div>
          </Card>

          <NotificationsList userId={user.id} />
        </>
      )}
    </PortalLayout>
  );
}
