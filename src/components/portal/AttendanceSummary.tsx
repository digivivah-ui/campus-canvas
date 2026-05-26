import { Card } from '@/components/ui/card';
import { CalendarCheck } from 'lucide-react';

interface Att { status: string; date?: string }
interface Props { records: Att[]; compact?: boolean }

export function AttendanceSummary({ records, compact }: Props) {
  const total = records.length || 1;
  const present = records.filter(a => a.status === 'present' || a.status === 'late').length;
  const absent = records.filter(a => a.status === 'absent').length;
  const pct = Math.round((present / total) * 100);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Attendance</h3>
        </div>
        <span className="text-xs text-muted-foreground">{records.length} days</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="py-3 rounded-xl bg-green-50">
          <p className="text-xl font-bold text-green-600">{present}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">Present</p>
        </div>
        <div className="py-3 rounded-xl bg-red-50">
          <p className="text-xl font-bold text-red-600">{absent}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">Absent</p>
        </div>
        <div className="py-3 rounded-xl bg-primary/10">
          <p className="text-xl font-bold text-primary">{pct}%</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">Rate</p>
        </div>
      </div>
    </Card>
  );
}
