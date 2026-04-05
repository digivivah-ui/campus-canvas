import { AdminLayout } from '@/layouts/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, GraduationCap, AlertTriangle, TrendingUp, School } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useCourseStructure } from '@/hooks/useCourseStructure';
import { useState, useMemo } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#6366f1', '#f59e0b', '#10b981', '#ef4444'];

export default function AdminAnalytics() {
  const {
    courses, years, classes, sections,
    collegeCourses, schoolCourses,
    getCourseName, getYearName, getSemesterName, getClassName, getSectionName, getCourseType,
  } = useCourseStructure();

  const [institutionFilter, setInstitutionFilter] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterSub, setFilterSub] = useState<string>('all'); // year or class

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

  const filteredCourses = useMemo(() => {
    if (institutionFilter === 'college') return collegeCourses;
    if (institutionFilter === 'school') return schoolCourses;
    return courses.filter(c => c.is_active);
  }, [institutionFilter, courses, collegeCourses, schoolCourses]);

  const subItems = useMemo(() => {
    if (filterCourse === 'all') return [];
    const type = getCourseType(filterCourse);
    if (type === 'college') return years.filter(y => y.course_id === filterCourse);
    return classes.filter(cl => cl.course_id === filterCourse);
  }, [filterCourse, years, classes, getCourseType]);

  const filtered = useMemo(() => {
    let list = students;
    if (institutionFilter !== 'all') {
      const courseIds = new Set((institutionFilter === 'college' ? collegeCourses : schoolCourses).map(c => c.id));
      list = list.filter(s => s.course_id && courseIds.has(s.course_id));
    }
    if (filterCourse !== 'all') {
      list = list.filter(s => s.course_id === filterCourse);
    }
    if (filterSub !== 'all') {
      const type = filterCourse !== 'all' ? getCourseType(filterCourse) : null;
      if (type === 'college') list = list.filter(s => s.year_id === filterSub);
      else if (type === 'school') list = list.filter(s => s.class_id === filterSub);
    }
    return list;
  }, [students, institutionFilter, filterCourse, filterSub, collegeCourses, schoolCourses, getCourseType]);

  const totalStudents = filtered.length;
  const totalDefaulters = filtered.filter(s => Number(s.total_fees) - Number(s.paid_fees) > 0).length;
  const totalPending = filtered.reduce((sum, s) => sum + (Number(s.total_fees) - Number(s.paid_fees)), 0);
  const totalCollected = fees.reduce((sum, f) => sum + Number(f.amount), 0);

  const feesByCourseData = useMemo(() => {
    const map: Record<string, number> = {};
    fees.forEach(f => { const key = f.course || 'Other'; map[key] = (map[key] || 0) + Number(f.amount); });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [fees]);

  const defaulters = useMemo(() =>
    filtered.map(s => ({ ...s, pending: Number(s.total_fees) - Number(s.paid_fees) })).filter(s => s.pending > 0).sort((a, b) => b.pending - a.pending),
    [filtered]
  );

  const admissionTrendData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(s => { const month = format(parseISO(s.admission_date), 'yyyy-MM'); map[month] = (map[month] || 0) + 1; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month: format(parseISO(month + '-01'), 'MMM yyyy'), count }));
  }, [filtered]);

  const courseDistData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(s => { const name = s.course_id ? getCourseName(s.course_id) : s.course; map[name] = (map[name] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered, getCourseName]);

  const subDistData = useMemo(() => {
    const map: Record<string, number> = {};
    const showSchool = institutionFilter === 'school' || (filterCourse !== 'all' && getCourseType(filterCourse) === 'school');
    filtered.forEach(s => {
      if (showSchool) {
        const name = s.class_id ? getClassName(s.class_id) : '-';
        map[name] = (map[name] || 0) + 1;
      } else {
        const name = s.year_id ? getYearName(s.year_id) : `Year ${s.year}`;
        map[name] = (map[name] || 0) + 1;
      }
    });
    return { data: Object.entries(map).map(([name, value]) => ({ name, value })), label: showSchool ? 'Students by Class' : 'Students by Year' };
  }, [filtered, institutionFilter, filterCourse, getCourseType, getClassName, getYearName]);

  const subLabel = filterCourse !== 'all' && getCourseType(filterCourse) === 'school' ? 'Class' : 'Year';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <ToggleGroup type="single" value={institutionFilter} onValueChange={v => { setInstitutionFilter(v || 'all'); setFilterCourse('all'); setFilterSub('all'); }} className="border rounded-lg p-1">
            <ToggleGroupItem value="all" className="px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">All</ToggleGroupItem>
            <ToggleGroupItem value="college" className="gap-1 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"><GraduationCap className="h-4 w-4" />College</ToggleGroupItem>
            <ToggleGroupItem value="school" className="gap-1 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"><School className="h-4 w-4" />School</ToggleGroupItem>
          </ToggleGroup>
          <Select value={filterCourse} onValueChange={v => { setFilterCourse(v); setFilterSub('all'); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Courses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {filteredCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {filterCourse !== 'all' && subItems.length > 0 && (
            <Select value={filterSub} onValueChange={setFilterSub}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={`All ${subLabel}s`} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {subLabel}s</SelectItem>
                {subItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard icon={Users} label="Total Students" value={totalStudents} />
          <SummaryCard icon={TrendingUp} label="Fees Collected" value={`₹${totalCollected.toLocaleString('en-IN')}`} />
          <SummaryCard icon={AlertTriangle} label="Defaulters" value={totalDefaulters} variant="destructive" />
          <SummaryCard icon={GraduationCap} label="Pending Fees" value={`₹${totalPending.toLocaleString('en-IN')}`} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Fees Collected Per Course</CardTitle></CardHeader>
            <CardContent>
              {feesByCourseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={feesByCourseData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-10">No fees data yet.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Monthly Admission Trends</CardTitle></CardHeader>
            <CardContent>
              {admissionTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={admissionTrendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} /></LineChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-10">No admission data yet.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Students by Course</CardTitle></CardHeader>
            <CardContent>
              {courseDistData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart><Pie data={courseDistData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{courseDistData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-10">No student data yet.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{subDistData.label}</CardTitle></CardHeader>
            <CardContent>
              {subDistData.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={subDistData.data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} /></BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground text-center py-10">No student data yet.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Defaulters */}
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
                      <TableHead>Year/Class</TableHead>
                      <TableHead className="text-right">Total Fees</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defaulters.map(s => {
                      const type = s.course_id ? getCourseType(s.course_id) : 'college';
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.course_id ? getCourseName(s.course_id) : s.course}</TableCell>
                          <TableCell>{type === 'school' ? (s.class_id ? getClassName(s.class_id) : '-') : (s.year_id ? getYearName(s.year_id) : s.year)}</TableCell>
                          <TableCell className="text-right">₹{Number(s.total_fees).toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right">₹{Number(s.paid_fees).toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right font-semibold text-destructive">₹{s.pending.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                      );
                    })}
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
        <div><p className="text-sm text-muted-foreground">{label}</p><p className="text-xl font-bold">{value}</p></div>
      </CardContent>
    </Card>
  );
}
