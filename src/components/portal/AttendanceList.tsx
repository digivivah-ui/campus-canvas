import { Card } from '@/components/ui/card';
import { Check, X, Clock } from 'lucide-react';

interface Att { id: string; date: string; status: string; remarks?: string | null }

const meta: Record<string, { label: string; cls: string; icon: any }> = {
  present: { label: 'Present', cls: 'bg-green-50 text-green-700 border-green-200', icon: Check },
  absent: { label: 'Absent', cls: 'bg-red-50 text-red-700 border-red-200', icon: X },
  late: { label: 'Late', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
};

export function AttendanceList({ records }: { records: Att[] }) {
  return (
    <Card className="p-2 divide-y">
      {records.map(r => {
        const m = meta[r.status] ?? meta.present;
        const Icon = m.icon;
        return (
          <div key={r.id} className="flex items-center justify-between px-3 py-3">
            <div>
              <p className="text-sm font-medium">{new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
              {r.remarks && <p className="text-xs text-muted-foreground mt-0.5">{r.remarks}</p>}
            </div>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${m.cls}`}>
              <Icon className="h-3 w-3" /> {m.label}
            </span>
          </div>
        );
      })}
    </Card>
  );
}
