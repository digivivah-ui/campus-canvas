import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useParentCtx } from '@/contexts/ParentContext';
import { StudentProfileCard } from '@/components/portal/StudentProfileCard';
import { FeeSummaryCards } from '@/components/portal/FeeSummaryCards';
import { AttendanceSummary } from '@/components/portal/AttendanceSummary';
import { ChildSwitcher } from '@/components/portal/ChildSwitcher';
import { PortalSkeleton } from '@/components/portal/PortalSkeleton';
import { EmptyState } from '@/components/portal/EmptyState';
import { Card } from '@/components/ui/card';
import { Users, Bell, ChevronRight, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ParentDashboard() {
  const { loading, children, selected, selectedId, setSelectedId, classMap, sectionMap } = useParentCtx();
  const [attendance, setAttendance] = useState<{ status: string }[]>([]);
  const [recentFees, setRecentFees] = useState<{ id: string; amount: number; date: string }[]>([]);
  const [unreadNotices, setUnreadNotices] = useState(0);
  const [latestNotice, setLatestNotice] = useState<{ title: string; created_at: string } | null>(null);

  useEffect(() => {
    if (!selectedId || !selected) return;
    (async () => {
      const [{ data: a }, { data: f }, { data: n }, { data: r }] = await Promise.all([
        supabase.from('attendance').select('status').eq('student_id', selectedId).order('date', { ascending: false }).limit(60),
        supabase.from('fees_collection').select('id,amount,date').eq('student_id', selectedId).order('date', { ascending: false }).limit(3),
        supabase.from('notifications').select('id,title,created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('notification_reads').select('notification_id'),
      ]);
      setAttendance((a ?? []) as any);
      setRecentFees((f ?? []) as any);
      const notices = n ?? [];
      const readSet = new Set((r ?? []).map((x: any) => x.notification_id));
      setUnreadNotices(notices.filter((x: any) => !readSet.has(x.id)).length);
      setLatestNotice(notices[0] ? { title: notices[0].title, created_at: notices[0].created_at } : null);
    })();
  }, [selectedId, selected]);

  if (loading) return <PortalSkeleton />;
  if (children.length === 0) {
    return <EmptyState icon={Users} title="No child linked yet" description="Please contact the school office to link your child's profile." />;
  }
  if (!selected) return null;

  return (
    <>
      <ChildSwitcher children={children} selectedId={selectedId} onSelect={setSelectedId} />
      <StudentProfileCard
        name={selected.name}
        course={selected.course}
        admissionNumber={selected.admission_number}
        className={selected.class_id ? classMap[selected.class_id] : null}
        section={selected.section_id ? sectionMap[selected.section_id] : null}
        imageUrl={selected.profile_image_url}
      />
      <FeeSummaryCards paid={Number(selected.paid_fees)} pending={Math.max(0, Number(selected.total_fees) - Number(selected.paid_fees))} />
      <AttendanceSummary records={attendance} />

      <Link to="/parent/receipts" className="block">
        <Card className="p-4 flex items-center gap-3 active:bg-muted transition-colors">
          <div className="p-2 rounded-lg bg-primary/10"><Receipt className="h-4 w-4 text-primary" /></div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Recent Payments</p>
            <p className="text-xs text-muted-foreground">{recentFees.length} payment{recentFees.length !== 1 ? 's' : ''} • view receipts</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Card>
      </Link>

      <Link to="/parent/notices" className="block">
        <Card className="p-4 flex items-center gap-3 active:bg-muted transition-colors">
          <div className="p-2 rounded-lg bg-accent/30"><Bell className="h-4 w-4 text-accent-foreground" /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">Notices</p>
              {unreadNotices > 0 && <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">{unreadNotices}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground truncate">{latestNotice ? latestNotice.title : 'No notices yet'}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Card>
      </Link>
    </>
  );
}
