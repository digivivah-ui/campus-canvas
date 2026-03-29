import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';

type Course = { id: string; name: string; description: string | null; is_active: boolean; created_at: string };
type Year = { id: string; name: string; course_id: string; is_active: boolean; created_at: string };
type Semester = { id: string; name: string; year_id: string; is_active: boolean; created_at: string };

export default function AdminCourseStructure() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*').order('name');
      if (error) throw error;
      return data as Course[];
    },
  });

  const { data: years = [] } = useQuery<Year[]>({
    queryKey: ['years'],
    queryFn: async () => {
      const { data, error } = await supabase.from('years').select('*').order('name');
      if (error) throw error;
      return data as Year[];
    },
  });

  const { data: semesters = [] } = useQuery<Semester[]>({
    queryKey: ['semesters'],
    queryFn: async () => {
      const { data, error } = await supabase.from('semesters').select('*').order('name');
      if (error) throw error;
      return data as Semester[];
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Tree View */}
        <Card>
          <CardHeader><CardTitle className="text-base">Course Hierarchy</CardTitle></CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No courses yet. Add one below.</p>
            ) : (
              <div className="space-y-2">
                {courses.filter(c => c.is_active).map(course => {
                  const courseYears = years.filter(y => y.course_id === course.id && y.is_active);
                  return (
                    <div key={course.id} className="border rounded-lg p-3">
                      <p className="font-semibold text-sm flex items-center gap-1">{course.name}</p>
                      {courseYears.length > 0 && (
                        <div className="ml-4 mt-2 space-y-1">
                          {courseYears.map(year => {
                            const yearSems = semesters.filter(s => s.year_id === year.id && s.is_active);
                            return (
                              <div key={year.id}>
                                <p className="text-sm text-muted-foreground flex items-center gap-1"><ChevronRight className="h-3 w-3" />{year.name}</p>
                                {yearSems.length > 0 && (
                                  <div className="ml-5 flex flex-wrap gap-1 mt-1">
                                    {yearSems.map(sem => (
                                      <Badge key={sem.id} variant="secondary" className="text-xs">{sem.name}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Management Tabs */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList className="w-full flex flex-wrap h-auto gap-1">
            <TabsTrigger value="courses" className="flex-1 min-w-[100px]">Courses</TabsTrigger>
            <TabsTrigger value="years" className="flex-1 min-w-[100px]">Years</TabsTrigger>
            <TabsTrigger value="semesters" className="flex-1 min-w-[100px]">Semesters</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <CoursesTab courses={courses} />
          </TabsContent>
          <TabsContent value="years">
            <YearsTab years={years} courses={courses} />
          </TabsContent>
          <TabsContent value="semesters">
            <SemestersTab semesters={semesters} years={years} courses={courses} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function CoursesTab({ courses }: { courses: Course[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Course | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name, description: form.description || null };
      if (editItem) {
        const { error } = await supabase.from('courses').update(payload).eq('id', editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('courses').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); setOpen(false); setEditItem(null); toast({ title: 'Saved' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('courses').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast({ title: 'Deleted' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const toggle = useMutation({
    mutationFn: async (c: Course) => { const { error } = await supabase.from('courses').update({ is_active: !c.is_active }).eq('id', c.id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast({ title: 'Updated' }); },
  });

  const openAdd = () => { setEditItem(null); setForm({ name: '', description: '' }); setOpen(true); };
  const openEdit = (c: Course) => { setEditItem(c); setForm({ name: c.name, description: c.description ?? '' }); setOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Courses</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Course</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Course</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name*</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. BBA, BCA, BSc" /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <Button className="w-full" onClick={() => save.mutate()} disabled={!form.name || save.isPending}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {courses.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.description || '-'}</TableCell>
                <TableCell>
                  <Badge className="cursor-pointer" variant={c.is_active ? 'default' : 'secondary'} onClick={() => toggle.mutate(c)}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {courses.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No courses yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function YearsTab({ years, courses }: { years: Year[]; courses: Course[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Year | null>(null);
  const [form, setForm] = useState({ name: '', course_id: '' });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name, course_id: form.course_id };
      if (editItem) {
        const { error } = await supabase.from('years').update(payload).eq('id', editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('years').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['years'] }); setOpen(false); setEditItem(null); toast({ title: 'Saved' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('years').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['years'] }); toast({ title: 'Deleted' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const toggle = useMutation({
    mutationFn: async (y: Year) => { const { error } = await supabase.from('years').update({ is_active: !y.is_active }).eq('id', y.id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['years'] }); toast({ title: 'Updated' }); },
  });

  const openAdd = () => { setEditItem(null); setForm({ name: '', course_id: '' }); setOpen(true); };
  const openEdit = (y: Year) => { setEditItem(y); setForm({ name: y.name, course_id: y.course_id }); setOpen(true); };

  const activeCourses = courses.filter(c => c.is_active);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Years</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Year</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Year</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name*</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. 1st Year" /></div>
              <div>
                <Label>Course*</Label>
                <Select value={form.course_id} onValueChange={v => setForm(p => ({ ...p, course_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>{activeCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => save.mutate()} disabled={!form.name || !form.course_id || save.isPending}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Course</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {years.map(y => (
              <TableRow key={y.id}>
                <TableCell className="font-medium">{y.name}</TableCell>
                <TableCell>{courses.find(c => c.id === y.course_id)?.name || '-'}</TableCell>
                <TableCell>
                  <Badge className="cursor-pointer" variant={y.is_active ? 'default' : 'secondary'} onClick={() => toggle.mutate(y)}>
                    {y.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(y)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del.mutate(y.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {years.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No years yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SemestersTab({ semesters, years, courses }: { semesters: Semester[]; years: Year[]; courses: Course[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Semester | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [form, setForm] = useState({ name: '', year_id: '' });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name, year_id: form.year_id };
      if (editItem) {
        const { error } = await supabase.from('semesters').update(payload).eq('id', editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('semesters').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['semesters'] }); setOpen(false); setEditItem(null); toast({ title: 'Saved' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('semesters').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['semesters'] }); toast({ title: 'Deleted' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const toggle = useMutation({
    mutationFn: async (s: Semester) => { const { error } = await supabase.from('semesters').update({ is_active: !s.is_active }).eq('id', s.id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['semesters'] }); toast({ title: 'Updated' }); },
  });

  const openAdd = () => { setEditItem(null); setSelectedCourse(''); setForm({ name: '', year_id: '' }); setOpen(true); };
  const openEdit = (s: Semester) => {
    setEditItem(s);
    const year = years.find(y => y.id === s.year_id);
    setSelectedCourse(year?.course_id ?? '');
    setForm({ name: s.name, year_id: s.year_id });
    setOpen(true);
  };

  const activeCourses = courses.filter(c => c.is_active);
  const filteredYears = years.filter(y => y.course_id === selectedCourse && y.is_active);

  const getYearName = (yearId: string) => years.find(y => y.id === yearId)?.name || '-';
  const getCourseName = (yearId: string) => {
    const year = years.find(y => y.id === yearId);
    return year ? courses.find(c => c.id === year.course_id)?.name || '-' : '-';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Semesters</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Semester</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Semester</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name*</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Semester 1" /></div>
              <div>
                <Label>Course*</Label>
                <Select value={selectedCourse} onValueChange={v => { setSelectedCourse(v); setForm(p => ({ ...p, year_id: '' })); }}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>{activeCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year*</Label>
                <Select value={form.year_id} onValueChange={v => setForm(p => ({ ...p, year_id: v }))} disabled={!selectedCourse}>
                  <SelectTrigger><SelectValue placeholder={selectedCourse ? "Select year" : "Select course first"} /></SelectTrigger>
                  <SelectContent>{filteredYears.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => save.mutate()} disabled={!form.name || !form.year_id || save.isPending}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Year</TableHead><TableHead>Course</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {semesters.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{getYearName(s.year_id)}</TableCell>
                <TableCell>{getCourseName(s.year_id)}</TableCell>
                <TableCell>
                  <Badge className="cursor-pointer" variant={s.is_active ? 'default' : 'secondary'} onClick={() => toggle.mutate(s)}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del.mutate(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {semesters.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No semesters yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
