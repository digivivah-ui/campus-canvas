import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PortalLayout } from '@/layouts/PortalLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationsList } from '@/components/portal/NotificationsList';
import { Download, Printer, MessageCircle, IndianRupee, CalendarCheck, User } from 'lucide-react';
import { PageLoader } from '@/components/common/LoadingSpinner';

interface Student {
  id: string; name: string; admission_number: string | null;
  course: string; total_fees: number; paid_fees: number;
  profile_image_url: string | null; parent_phone: string | null;
  class_id: string | null; section_id: string | null;
}
interface Fee { id: string; amount: number; date: string; }
interface Att { id: string; date: string; status: string; }

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [fees, setFees] = useState<Fee[]>([]);
  const [attendance, setAttendance] = useState<Att[]>([]);
  const [classMap, setClassMap] = useState<Record<string, string>>({});
  const [sectionMap, setSectionMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: kids } = await supabase.from('students').select('*').eq('parent_auth_user_id', user.id);
      const list = (kids ?? []) as Student[];
      setChildren(list);
      if (list[0]) setSelectedId(list[0].id);
      const [{ data: cls }, { data: secs }] = await Promise.all([
        supabase.from('classes').select('id,name'),
        supabase.from('sections').select('id,name'),
      ]);
      setClassMap(Object.fromEntries((cls ?? []).map((c: any) => [c.id, c.name])));
      setSectionMap(Object.fromEntries((secs ?? []).map((s: any) => [s.id, s.name])));
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const [{ data: f }, { data: a }] = await Promise.all([
        supabase.from('fees_collection').select('id,amount,date').eq('student_id', selectedId).order('date', { ascending: false }),
        supabase.from('attendance').select('id,date,status').eq('student_id', selectedId).order('date', { ascending: false }).limit(60),
      ]);
      setFees((f ?? []) as Fee[]);
      setAttendance((a ?? []) as Att[]);
    })();
  }, [selectedId]);

  const student = useMemo(() => children.find(c => c.id === selectedId), [children, selectedId]);
  const pending = student ? Math.max(0, Number(student.total_fees) - Number(student.paid_fees)) : 0;
  const attStats = useMemo(() => {
    const total = attendance.length || 1;
    const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    return { total: attendance.length, present, absent: attendance.filter(a => a.status === 'absent').length, pct: Math.round((present / total) * 100) };
  }, [attendance]);

  const printReceipt = (fee: Fee) => {
    if (!student) return;
    const html = `<html><head><title>Receipt</title><style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:auto}h1{color:#1e3a8a}table{width:100%;border-collapse:collapse;margin-top:20px}td{padding:8px 0;border-bottom:1px solid #eee}</style></head><body><h1>MGCM • Fee Receipt</h1><p>Receipt ID: ${fee.id.slice(0,8).toUpperCase()}</p><p>Date: ${new Date(fee.date).toLocaleDateString()}</p><table><tr><td><b>Student</b></td><td>${student.name}</td></tr><tr><td><b>Admission No</b></td><td>${student.admission_number ?? '-'}</td></tr><tr><td><b>Course</b></td><td>${student.course}</td></tr><tr><td><b>Amount Paid</b></td><td>₹${Number(fee.amount).toLocaleString('en-IN')}</td></tr></table><p style="margin-top:30px;color:#666;font-size:12px">This is a computer-generated receipt.</p></body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html); w.document.close(); w.focus(); w.print();
  };

  const downloadReceipt = (fee: Fee) => {
    if (!student) return;
    const txt = `MGCM Fee Receipt\n\nReceipt: ${fee.id.slice(0,8).toUpperCase()}\nDate: ${new Date(fee.date).toLocaleDateString()}\nStudent: ${student.name}\nAdmission No: ${student.admission_number ?? '-'}\nCourse: ${student.course}\nAmount: ₹${Number(fee.amount).toLocaleString('en-IN')}\n`;
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `receipt-${fee.id.slice(0,8)}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const whatsappShare = (fee: Fee) => {
    if (!student) return;
    const msg = `Fee Receipt - MGCM%0A%0AStudent: ${student.name}%0AAdmission: ${student.admission_number ?? '-'}%0AAmount: ₹${Number(fee.amount).toLocaleString('en-IN')}%0ADate: ${new Date(fee.date).toLocaleDateString()}`;
    const phone = (student.parent_phone || '').replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  if (loading) return <PageLoader />;
  if (!user) return null;

  return (
    <PortalLayout title="Parent Portal" subtitle={student ? student.name : 'Welcome'} loginPath="/parent/login">
      {children.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No linked children found for your account.</p>
        </Card>
      ) : (
        <>
          {children.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {children.map(c => (
                <button key={c.id} onClick={() => setSelectedId(c.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedId === c.id ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {student && (
            <>
              <Card className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {student.profile_image_url
                      ? <img src={student.profile_image_url} alt={student.name} className="h-full w-full object-cover" />
                      : <User className="h-7 w-7 text-primary" />}
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
                <div className="flex items-center gap-2 mb-3">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Attendance</h3>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-green-500/10"><p className="text-lg font-bold text-green-600">{attStats.present}</p><p className="text-xs text-muted-foreground">Present</p></div>
                  <div className="p-2 rounded-lg bg-destructive/10"><p className="text-lg font-bold text-destructive">{attStats.absent}</p><p className="text-xs text-muted-foreground">Absent</p></div>
                  <div className="p-2 rounded-lg bg-primary/10"><p className="text-lg font-bold text-primary">{attStats.pct}%</p><p className="text-xs text-muted-foreground">Rate</p></div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Payment History</h3>
                {fees.length === 0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> : (
                  <div className="space-y-2">
                    {fees.slice(0, 10).map(f => (
                      <div key={f.id} className="p-3 rounded-lg border bg-background">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">₹{Number(f.amount).toLocaleString('en-IN')}</p>
                            <p className="text-xs text-muted-foreground">{new Date(f.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => downloadReceipt(f)}><Download className="h-3.5 w-3.5 mr-1" />Download</Button>
                          <Button size="sm" variant="outline" onClick={() => printReceipt(f)}><Printer className="h-3.5 w-3.5 mr-1" />Print</Button>
                          <Button size="sm" variant="outline" onClick={() => whatsappShare(f)}><MessageCircle className="h-3.5 w-3.5 mr-1" />Share</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <NotificationsList userId={user.id} />
            </>
          )}
        </>
      )}
    </PortalLayout>
  );
}
