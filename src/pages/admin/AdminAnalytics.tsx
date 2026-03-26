import { AdminLayout } from '@/layouts/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, GraduationCap, AlertTriangle, TrendingUp } from 'lucide-react';
import { format, parseISO, startOfMonth } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#6366f1', '#f59e0b', '#10b981', '#ef4444'];

export default function AdminAnalytics() {
  const { data: students = [] } = useQuery({
    queryKey: ['analytics-students'],
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: fees = [] } = useQuery({
    queryKey: ['analytics-fees'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fees_collection').select('*');
      if (error) throw error;
      return data;
    },
  });

  // Summary stats
  const totalStudents = students.length;
  const totalDefaulters = students.filter((s) => Number(s.total_fees) - Number(s.paid_fees) > 0).length;
  const totalPending = students.reduce((sum, s) => sum + (Number(s.total_fees) - Number(s.paid_fees)), 0);
  const totalCollected = fees.reduce((sum, f) => sum + Number(f.amount), 0);

  // Fees per course (from fees_collection)
  const feesByCourse: Record<string, number> = {};
  fees.forEach((f) => {
    const course = f.course || 'Other';
    feesByCourse[course] = (feesByCourse[course] || 0) + Number(f.amount);
  });
  const feesByCourseData = Object.entries(feesByCourse).map(([name, value]) => ({ name, value }));

  // Defaulters list
  const defaulters = students
    .map((s) => ({ ...s, pending: Number(s.total_fees) - Number(s.paid_fees) }))
    .filter((s) => s.pending > 0)
    .sort((a, b) => b.pending - a.pending);

  // Monthly admission trends
  const admissionsByMonth: Record<string, number> = {};
  students.forEach((s) => {
    const month = format(parseISO(s.admission_date), 'yyyy-MM');
    admissionsByMonth[month] = (admissionsByMonth[month] || 0) + 1;
  });
  const admissionTrendData = Object.entries(admissionsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month: format(parseISO(month + '-01'), 'MMM yyyy'), count }));

  // Student distribution by course
  const byCourse: Record<string, number> = {};
  students.forEach((s) => { byCourse[s.course] = (byCourse[s.course] || 0) + 1; });
  const courseDistData = Object.entries(byCourse).map(([name, value]) => ({ name, value }));

  // Student distribution by year
  const byYear: Record<string, number> = {};
  students.forEach((s) => { byYear[`Year ${s.year}`] = (byYear[`Year ${s.year}`] || 0) + 1; });
  const yearDistData = Object.entries(byYear).map(([name, value]) => ({ name, value }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard icon={Users} label="Total Students" value={totalStudents} />
          <SummaryCard icon={TrendingUp} label="Fees Collected" value={`₹${totalCollected.toLocaleString('en-IN')}`} />
          <SummaryCard icon={AlertTriangle} label="Defaulters" value={totalDefaulters} variant="destructive" />
          <SummaryCard icon={GraduationCap} label="Pending Fees" value={`₹${totalPending.toLocaleString('en-IN')}`} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Fees Collected Per Course</CardTitle></CardHeader>
            <CardContent>
              {feesByCourseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={feesByCourseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-10">No fees data yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Monthly Admission Trends</CardTitle></CardHeader>
            <CardContent>
              {admissionTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={admissionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-10">No admission data yet.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 - Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Students by Course</CardTitle></CardHeader>
            <CardContent>
              {courseDistData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={courseDistData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {courseDistData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-10">No student data yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Students by Year</CardTitle></CardHeader>
            <CardContent>
              {yearDistData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={yearDistData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-10">No student data yet.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Defaulters Table */}
        <Card>
          <CardHeader><CardTitle className="text-base">Fee Defaulters ({defaulters.length})</CardTitle></CardHeader>
          <CardContent>
            {defaulters.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Total Fees</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defaulters.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.course}</TableCell>
                        <TableCell>{s.year}</TableCell>
                        <TableCell className="text-right">₹{Number(s.total_fees).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right">₹{Number(s.paid_fees).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-semibold text-destructive">₹{s.pending.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-6">No defaulters — all fees are paid! 🎉</p>}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function SummaryCard({ icon: Icon, label, value, variant }: { icon: any; label: string; value: string | number; variant?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`p-3 rounded-lg ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
