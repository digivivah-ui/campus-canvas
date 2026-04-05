import { useState, useMemo } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCourseStructure } from '@/hooks/useCourseStructure';
import { Plus, Pencil, Search, Eye, Users, GraduationCap, UserPlus, ChevronLeft, ChevronRight, BookOpen, Calendar, Layers, ArrowLeft, X, School } from 'lucide-react';

type Student = {
  id: string; name: string; full_name: string | null; gender: string | null; date_of_birth: string | null;
  phone: string | null; email: string | null; address: string | null; course: string;
  course_id: string | null; year: number; year_id: string | null; semester: number; semester_id: string | null;
  class_id: string | null; section_id: string | null;
  admission_date: string; admission_number: string | null; admission_status: string;
  total_fees: number; paid_fees: number; created_at: string; updated_at: string;
};

const ITEMS_PER_PAGE = 15;

const emptyForm = {
  full_name: '', gender: '', date_of_birth: '', phone: '', email: '', address: '',
  course_id: '', year_id: '', semester_id: '', class_id: '', section_id: '',
  admission_date: new Date().toISOString().split('T')[0],
  total_fees: '', paid_fees: '0', admission_status: 'active',
};

type FilterContext = { type: 'course' | 'year' | 'semester' | 'class' | 'section'; id: string; label: string } | null;

export default function AdminStudents() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const {
    courses, years, semesters, classes, sections,
    activeCourses, collegeCourses, schoolCourses,
    getYearsForCourse, getSemestersForYear, getClassesForCourse, getSectionsForClass,
    getCourseName, getYearName, getSemesterName, getClassName, getSectionName, getCourseType,
  } = useCourseStructure();

  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [activeFilter, setActiveFilter] = useState<FilterContext>(null);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['admin-students'],
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Student[];
    },
  });

  const { data: studentFees = [] } = useQuery({
    queryKey: ['student-fees', profileStudent?.id],
    enabled: !!profileStudent,
    queryFn: async () => {
      const { data, error } = await supabase.from('fees_collection').select('*').eq('student_id', profileStudent!.id).order('date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const analytics = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => s.admission_status === 'active').length;
    const totalPending = students.reduce((sum, s) => sum + Math.max(0, Number(s.total_fees) - Number(s.paid_fees)), 0);
    const byCourse: Record<string, number> = {};
    const byYear: Record<string, number> = {};
    const bySemester: Record<string, number> = {};
    const byClass: Record<string, number> = {};
    const bySection: Record<string, number> = {};
    students.forEach(s => {
      if (s.course_id) byCourse[s.course_id] = (byCourse[s.course_id] || 0) + 1;
      if (s.year_id) byYear[s.year_id] = (byYear[s.year_id] || 0) + 1;
      if (s.semester_id) bySemester[s.semester_id] = (bySemester[s.semester_id] || 0) + 1;
      if (s.class_id) byClass[s.class_id] = (byClass[s.class_id] || 0) + 1;
      if (s.section_id) bySection[s.section_id] = (bySection[s.section_id] || 0) + 1;
    });
    return { total, active, totalPending, byCourse, byYear, bySemester, byClass, bySection };
  }, [students]);

  const filtered = useMemo(() => {
    let list = students;
    if (activeFilter) {
      if (activeFilter.type === 'course') list = list.filter(s => s.course_id === activeFilter.id);
      if (activeFilter.type === 'year') list = list.filter(s => s.year_id === activeFilter.id);
      if (activeFilter.type === 'semester') list = list.filter(s => s.semester_id === activeFilter.id);
      if (activeFilter.type === 'class') list = list.filter(s => s.class_id === activeFilter.id);
      if (activeFilter.type === 'section') list = list.filter(s => s.section_id === activeFilter.id);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => (s.full_name || s.name || '').toLowerCase().includes(q) || (s.phone || '').includes(q) || (s.admission_number || '').toLowerCase().includes(q));
    }
    if (filterCourse !== 'all') list = list.filter(s => s.course_id === filterCourse);
    if (filterYear !== 'all') list = list.filter(s => s.year_id === filterYear);
    if (filterSemester !== 'all') list = list.filter(s => s.semester_id === filterSemester);
    if (filterClass !== 'all') list = list.filter(s => s.class_id === filterClass);
    if (filterSection !== 'all') list = list.filter(s => s.section_id === filterSection);
    if (filterStatus !== 'all') list = list.filter(s => s.admission_status === filterStatus);
    return list;
  }, [students, search, filterCourse, filterYear, filterSemester, filterClass, filterSection, filterStatus, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const filterYearsArr = filterCourse !== 'all' ? getYearsForCourse(filterCourse) : [];
  const filterSemestersArr = filterYear !== 'all' ? getSemestersForYear(filterYear) : [];
  const filterClassesArr = filterCourse !== 'all' ? getClassesForCourse(filterCourse) : [];
  const filterSectionsArr = filterClass !== 'all' ? getSectionsForClass(filterClass) : [];

  const handleCardClick = (type: FilterContext['type'], id: string, label: string) => {
    setActiveFilter({ type: type!, id, label });
    setSearch(''); setFilterCourse('all'); setFilterYear('all'); setFilterSemester('all');
    setFilterClass('all'); setFilterSection('all'); setFilterStatus('all'); setPage(1); setView('list');
  };

  const handleShowAllStudents = () => {
    setActiveFilter(null); setSearch(''); setFilterCourse('all'); setFilterYear('all'); setFilterSemester('all');
    setFilterClass('all'); setFilterSection('all'); setFilterStatus('all'); setPage(1); setView('list');
  };

  const handleBackToDashboard = () => {
    setView('dashboard'); setActiveFilter(null); setSearch(''); setFilterCourse('all'); setFilterYear('all');
    setFilterSemester('all'); setFilterClass('all'); setFilterSection('all'); setFilterStatus('all'); setPage(1);
  };

  const generateAdmissionNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_admission_number');
    if (error) throw error;
    return data as string;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.full_name || !form.course_id) throw new Error('Please fill all required fields');
      const courseType = getCourseType(form.course_id);
      const courseName = getCourseName(form.course_id);

      if (courseType === 'college' && (!form.year_id || !form.semester_id)) throw new Error('Year and Semester are required for college courses');
      if (courseType === 'school' && (!form.class_id || !form.section_id)) throw new Error('Class and Section are required for school courses');

      const payload: any = {
        full_name: form.full_name, name: form.full_name,
        gender: form.gender || null, date_of_birth: form.date_of_birth || null,
        phone: form.phone || null, email: form.email || null, address: form.address || null,
        course_id: form.course_id, course: courseName,
        admission_date: form.admission_date,
        total_fees: Number(form.total_fees) || 0, paid_fees: Number(form.paid_fees) || 0,
        admission_status: form.admission_status,
      };

      if (courseType === 'college') {
        payload.year_id = form.year_id; payload.semester_id = form.semester_id;
        payload.class_id = null; payload.section_id = null;
      } else {
        payload.class_id = form.class_id; payload.section_id = form.section_id;
        payload.year_id = null; payload.semester_id = null;
      }

      if (editStudent) {
        const { error } = await supabase.from('students').update(payload).eq('id', editStudent.id);
        if (error) throw error;
      } else {
        payload.admission_number = await generateAdmissionNumber();
        payload.year = 1; payload.semester = 1;
        const { error } = await supabase.from('students').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-students'] });
      setFormOpen(false); setEditStudent(null); setForm(emptyForm);
      toast({ title: editStudent ? 'Student updated' : 'Student admitted successfully' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('students').update({ admission_status: status === 'active' ? 'inactive' : 'active' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-students'] }); toast({ title: 'Status updated' }); },
  });

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setForm({
      full_name: s.full_name || s.name || '', gender: s.gender || '', date_of_birth: s.date_of_birth || '',
      phone: s.phone || '', email: s.email || '', address: s.address || '',
      course_id: s.course_id || '', year_id: s.year_id || '', semester_id: s.semester_id || '',
      class_id: s.class_id || '', section_id: s.section_id || '',
      admission_date: s.admission_date || '', total_fees: String(s.total_fees || 0),
      paid_fees: String(s.paid_fees || 0), admission_status: s.admission_status || 'active',
    });
    setFormOpen(true);
  };

  const openAdd = () => { setEditStudent(null); setForm(emptyForm); setFormOpen(true); };

  // Determine selected course type for list view column display
  const selectedCourseType = filterCourse !== 'all' ? getCourseType(filterCourse) : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {view === 'list' && <Button variant="ghost" size="icon" onClick={handleBackToDashboard}><ArrowLeft className="h-5 w-5" /></Button>}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Students</h1>
              <p className="text-sm text-muted-foreground">{view === 'dashboard' ? 'Overview & analytics' : activeFilter ? `Showing: ${activeFilter.label}` : 'All students'}</p>
            </div>
          </div>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />New Admission</Button>
        </div>

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-primary/20" onClick={handleShowAllStudents}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary"><Users className="h-6 w-6" /></div>
                  <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Students</p><p className="text-2xl font-bold">{analytics.total}</p></div>
                </CardContent>
              </Card>
              <Card><CardContent className="flex items-center gap-4 p-5">
                <div className="p-3 rounded-xl bg-green-500/10 text-green-600"><GraduationCap className="h-6 w-6" /></div>
                <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</p><p className="text-2xl font-bold">{analytics.active}</p></div>
              </CardContent></Card>
              <Card><CardContent className="flex items-center gap-4 p-5">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600"><UserPlus className="h-6 w-6" /></div>
                <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Inactive</p><p className="text-2xl font-bold">{analytics.total - analytics.active}</p></div>
              </CardContent></Card>
              <Card><CardContent className="flex items-center gap-4 p-5">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive"><Layers className="h-6 w-6" /></div>
                <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Fees</p><p className="text-2xl font-bold">₹{analytics.totalPending.toLocaleString('en-IN')}</p></div>
              </CardContent></Card>
            </div>

            {/* College Course-wise */}
            {collegeCourses.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> College Courses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {collegeCourses.map(c => (
                    <Card key={c.id} className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all" onClick={() => handleCardClick('course', c.id, c.name)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div><p className="font-semibold text-sm">{c.name}</p><p className="text-xs text-muted-foreground">Click to view</p></div>
                        <div className="text-2xl font-bold text-primary">{analytics.byCourse[c.id] || 0}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* School Course-wise */}
            {schoolCourses.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><School className="h-5 w-5 text-primary" /> School Courses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {schoolCourses.map(c => (
                    <Card key={c.id} className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all" onClick={() => handleCardClick('course', c.id, c.name)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div><p className="font-semibold text-sm">{c.name}</p><p className="text-xs text-muted-foreground">Click to view</p></div>
                        <div className="text-2xl font-bold text-primary">{analytics.byCourse[c.id] || 0}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Year-wise (College) */}
            {years.filter(y => y.is_active).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Year-wise Distribution</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {years.filter(y => y.is_active).map(y => (
                    <Card key={y.id} className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all" onClick={() => handleCardClick('year', y.id, `${y.name} (${getCourseName(y.course_id)})`)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div><p className="font-semibold text-sm">{y.name}</p><p className="text-xs text-muted-foreground">{getCourseName(y.course_id)}</p></div>
                        <div className="text-2xl font-bold text-primary">{analytics.byYear[y.id] || 0}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Class-wise (School) */}
            {classes.filter(cl => cl.is_active).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><School className="h-5 w-5 text-primary" /> Class-wise Distribution</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {classes.filter(cl => cl.is_active).map(cl => (
                    <Card key={cl.id} className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all" onClick={() => handleCardClick('class', cl.id, `${cl.name} (${getCourseName(cl.course_id)})`)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div><p className="font-semibold text-sm">{cl.name}</p><p className="text-xs text-muted-foreground">{getCourseName(cl.course_id)}</p></div>
                        <div className="text-2xl font-bold text-primary">{analytics.byClass[cl.id] || 0}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Semester-wise */}
            {semesters.filter(s => s.is_active).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> Semester-wise Distribution</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {semesters.filter(s => s.is_active).map(s => {
                    const yr = years.find(y => y.id === s.year_id);
                    return (
                      <Card key={s.id} className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all" onClick={() => handleCardClick('semester', s.id, `${s.name} – ${yr ? `${getCourseName(yr.course_id)} / ${yr.name}` : ''}`)}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div><p className="font-semibold text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{yr ? `${getCourseName(yr.course_id)} · ${yr.name}` : ''}</p></div>
                          <div className="text-2xl font-bold text-primary">{analytics.bySemester[s.id] || 0}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section-wise */}
            {sections.filter(s => s.is_active).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> Section-wise Distribution</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {sections.filter(s => s.is_active).map(s => {
                    const cl = classes.find(c => c.id === s.class_id);
                    return (
                      <Card key={s.id} className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all" onClick={() => handleCardClick('section', s.id, `${s.name} – ${cl ? `${getCourseName(cl.course_id)} / ${cl.name}` : ''}`)}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div><p className="font-semibold text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{cl ? `${getCourseName(cl.course_id)} · ${cl.name}` : ''}</p></div>
                          <div className="text-2xl font-bold text-primary">{analytics.bySection[s.id] || 0}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          <div className="space-y-4">
            {activeFilter && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm px-3 py-1 gap-1">
                  {activeFilter.label}
                  <button onClick={() => { setActiveFilter(null); setPage(1); }} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
                </Badge>
                <span className="text-sm text-muted-foreground">{filtered.length} students</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, phone, admission no..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
              </div>
              <Select value={filterCourse} onValueChange={v => { setFilterCourse(v); setFilterYear('all'); setFilterSemester('all'); setFilterClass('all'); setFilterSection('all'); setPage(1); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Course" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {activeCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {filterCourse !== 'all' && selectedCourseType === 'college' && (
                <>
                  <Select value={filterYear} onValueChange={v => { setFilterYear(v); setFilterSemester('all'); setPage(1); }}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Years</SelectItem>{filterYearsArr.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {filterYear !== 'all' && (
                    <Select value={filterSemester} onValueChange={v => { setFilterSemester(v); setPage(1); }}>
                      <SelectTrigger className="w-[160px]"><SelectValue placeholder="Semester" /></SelectTrigger>
                      <SelectContent><SelectItem value="all">All Semesters</SelectItem>{filterSemestersArr.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                </>
              )}
              {filterCourse !== 'all' && selectedCourseType === 'school' && (
                <>
                  <Select value={filterClass} onValueChange={v => { setFilterClass(v); setFilterSection('all'); setPage(1); }}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Class" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Classes</SelectItem>{filterClassesArr.map(cl => <SelectItem key={cl.id} value={cl.id}>{cl.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {filterClass !== 'all' && (
                    <Select value={filterSection} onValueChange={v => { setFilterSection(v); setPage(1); }}>
                      <SelectTrigger className="w-[160px]"><SelectValue placeholder="Section" /></SelectTrigger>
                      <SelectContent><SelectItem value="all">All Sections</SelectItem>{filterSectionsArr.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                </>
              )}
              <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adm. No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Year/Class</TableHead>
                      <TableHead>Sem/Section</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map(s => {
                      const type = s.course_id ? getCourseType(s.course_id) : 'college';
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono text-xs">{s.admission_number || '-'}</TableCell>
                          <TableCell className="font-medium">{s.full_name || s.name}</TableCell>
                          <TableCell>{s.course_id ? getCourseName(s.course_id) : s.course}</TableCell>
                          <TableCell>{type === 'school' ? (s.class_id ? getClassName(s.class_id) : '-') : (s.year_id ? getYearName(s.year_id) : s.year)}</TableCell>
                          <TableCell>{type === 'school' ? (s.section_id ? getSectionName(s.section_id) : '-') : (s.semester_id ? getSemesterName(s.semester_id) : s.semester)}</TableCell>
                          <TableCell>{s.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={s.admission_status === 'active' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleStatus.mutate({ id: s.id, status: s.admission_status })}>
                              {s.admission_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => setProfileStudent(s)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {paginated.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">{isLoading ? 'Loading...' : 'No students found'}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{filtered.length} students</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-sm">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={formOpen} onOpenChange={v => { if (!v) { setFormOpen(false); setEditStudent(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editStudent ? 'Edit Student' : 'New Admission'}</DialogTitle></DialogHeader>
            <StudentForm
              form={form} setForm={setForm}
              courses={activeCourses}
              formYears={form.course_id ? getYearsForCourse(form.course_id) : []}
              formSemesters={form.year_id ? getSemestersForYear(form.year_id) : []}
              formClasses={form.course_id ? getClassesForCourse(form.course_id) : []}
              formSections={form.class_id ? getSectionsForClass(form.class_id) : []}
              getCourseType={getCourseType}
              onSubmit={() => saveMutation.mutate()}
              isPending={saveMutation.isPending}
              isEdit={!!editStudent}
            />
          </DialogContent>
        </Dialog>

        {/* Profile Dialog */}
        <Dialog open={!!profileStudent} onOpenChange={v => { if (!v) setProfileStudent(null); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Student Profile</DialogTitle></DialogHeader>
            {profileStudent && (
              <StudentProfile
                student={profileStudent}
                getCourseName={getCourseName} getYearName={getYearName} getSemesterName={getSemesterName}
                getClassName={getClassName} getSectionName={getSectionName} getCourseType={getCourseType}
                fees={studentFees}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

// --- Student Form ---
function StudentForm({
  form, setForm, courses, formYears, formSemesters, formClasses, formSections, getCourseType, onSubmit, isPending, isEdit,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  courses: { id: string; name: string }[];
  formYears: { id: string; name: string }[];
  formSemesters: { id: string; name: string }[];
  formClasses: { id: string; name: string }[];
  formSections: { id: string; name: string }[];
  getCourseType: (id: string | null) => string;
  onSubmit: () => void;
  isPending: boolean;
  isEdit: boolean;
}) {
  const courseType = form.course_id ? getCourseType(form.course_id) : null;
  const isValid = form.full_name && form.course_id && (
    courseType === 'college' ? form.year_id && form.semester_id :
    courseType === 'school' ? form.class_id && form.section_id : false
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} /></div>
          <div>
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={v => setForm(p => ({ ...p, gender: v }))}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          <div className="md:col-span-2"><Label>Address</Label><Textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} /></div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">Academic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Course *</Label>
            <Select value={form.course_id} onValueChange={v => setForm(p => ({ ...p, course_id: v, year_id: '', semester_id: '', class_id: '', section_id: '' }))}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {courseType === 'college' && (
            <>
              <div>
                <Label>Year *</Label>
                <Select value={form.year_id} onValueChange={v => setForm(p => ({ ...p, year_id: v, semester_id: '' }))} disabled={!form.course_id}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>{formYears.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Semester *</Label>
                <Select value={form.semester_id} onValueChange={v => setForm(p => ({ ...p, semester_id: v }))} disabled={!form.year_id}>
                  <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                  <SelectContent>{formSemesters.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </>
          )}
          {courseType === 'school' && (
            <>
              <div>
                <Label>Class *</Label>
                <Select value={form.class_id} onValueChange={v => setForm(p => ({ ...p, class_id: v, section_id: '' }))} disabled={!form.course_id}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{formClasses.map(cl => <SelectItem key={cl.id} value={cl.id}>{cl.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Section *</Label>
                <Select value={form.section_id} onValueChange={v => setForm(p => ({ ...p, section_id: v }))} disabled={!form.class_id}>
                  <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                  <SelectContent>{formSections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">Admission & Fees</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Admission Date *</Label><Input type="date" value={form.admission_date} onChange={e => setForm(p => ({ ...p, admission_date: e.target.value }))} /></div>
          <div><Label>Total Fees (₹)</Label><Input type="number" value={form.total_fees} onChange={e => setForm(p => ({ ...p, total_fees: e.target.value }))} /></div>
          <div><Label>Paid Fees (₹)</Label><Input type="number" value={form.paid_fees} onChange={e => setForm(p => ({ ...p, paid_fees: e.target.value }))} /></div>
        </div>
        {isEdit && (
          <div className="mt-4 w-48">
            <Label>Status</Label>
            <Select value={form.admission_status} onValueChange={v => setForm(p => ({ ...p, admission_status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Button className="w-full" onClick={onSubmit} disabled={!isValid || isPending}>
        {isPending ? 'Saving...' : isEdit ? 'Update Student' : 'Admit Student'}
      </Button>
    </div>
  );
}

// --- Student Profile ---
function StudentProfile({
  student, getCourseName, getYearName, getSemesterName, getClassName, getSectionName, getCourseType, fees,
}: {
  student: Student;
  getCourseName: (id: string | null) => string;
  getYearName: (id: string | null) => string;
  getSemesterName: (id: string | null) => string;
  getClassName: (id: string | null) => string;
  getSectionName: (id: string | null) => string;
  getCourseType: (id: string | null) => string;
  fees: any[];
}) {
  const pending = Math.max(0, Number(student.total_fees) - Number(student.paid_fees));
  const type = getCourseType(student.course_id);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Personal Information</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{student.full_name || student.name}</span></div>
          <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium capitalize">{student.gender || '-'}</span></div>
          <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium">{student.date_of_birth || '-'}</span></div>
          <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{student.phone || '-'}</span></div>
          <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{student.email || '-'}</span></div>
          <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{student.address || '-'}</span></div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Academic Information</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Type:</span> <Badge variant="outline" className="capitalize">{type}</Badge></div>
          <div><span className="text-muted-foreground">Course:</span> <span className="font-medium">{student.course_id ? getCourseName(student.course_id) : student.course}</span></div>
          {type === 'college' ? (
            <>
              <div><span className="text-muted-foreground">Year:</span> <span className="font-medium">{student.year_id ? getYearName(student.year_id) : student.year}</span></div>
              <div><span className="text-muted-foreground">Semester:</span> <span className="font-medium">{student.semester_id ? getSemesterName(student.semester_id) : student.semester}</span></div>
            </>
          ) : (
            <>
              <div><span className="text-muted-foreground">Class:</span> <span className="font-medium">{student.class_id ? getClassName(student.class_id) : '-'}</span></div>
              <div><span className="text-muted-foreground">Section:</span> <span className="font-medium">{student.section_id ? getSectionName(student.section_id) : '-'}</span></div>
            </>
          )}
          <div><span className="text-muted-foreground">Status:</span> <Badge variant={student.admission_status === 'active' ? 'default' : 'secondary'}>{student.admission_status}</Badge></div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Admission Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Admission No:</span> <span className="font-medium font-mono">{student.admission_number || '-'}</span></div>
          <div><span className="text-muted-foreground">Admission Date:</span> <span className="font-medium">{student.admission_date}</span></div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Fee Information</h3>
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">₹{Number(student.total_fees).toLocaleString('en-IN')}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Paid</p><p className="text-lg font-bold text-green-600">₹{Number(student.paid_fees).toLocaleString('en-IN')}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Pending</p><p className={`text-lg font-bold ${pending > 0 ? 'text-destructive' : 'text-green-600'}`}>₹{pending.toLocaleString('en-IN')}</p></CardContent></Card>
        </div>
      </div>

      {fees.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Fee Transactions</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {fees.map((f: any) => (
                  <TableRow key={f.id}><TableCell>{f.date}</TableCell><TableCell className="text-right">₹{Number(f.amount).toLocaleString('en-IN')}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
