import { useState, useMemo } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Plus, Pencil, Trash2, IndianRupee, TrendingUp, TrendingDown, Wallet, CircleDollarSign, Search, ArrowUpDown, ArrowUp, ArrowDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns';
import { useCourseStructure } from '@/hooks/useCourseStructure';

const PAGE_SIZE = 10;

function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safeP = Math.min(page, totalPages - 1);
  const paged = items.slice(safeP * pageSize, (safeP + 1) * pageSize);
  return { page: safeP, setPage, totalPages, paged, total: items.length };
}

function PaginationControls({ page, totalPages, setPage, total }: { page: number; totalPages: number; setPage: (p: number) => void; total: number }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 flex-wrap gap-2">
      <p className="text-sm text-muted-foreground">{total} record{total !== 1 ? 's' : ''}</p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button key={i} variant={i === page ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(i)}>{i + 1}</Button>
        )).slice(Math.max(0, page - 2), page + 3)}
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
  return dir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
}

function SortableHead({ children, sortKey, currentKey, dir, onSort }: { children: React.ReactNode; sortKey: string; currentKey: string; dir: 'asc' | 'desc'; onSort: (k: string) => void; className?: string }) {
  return (
    <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => onSort(sortKey)}>
      <span className="inline-flex items-center">{children}<SortIcon active={currentKey === sortKey} dir={dir} /></span>
    </TableHead>
  );
}

// --- Types ---
type Fee = { id: string; amount: number; date: string; student_name: string | null; course: string | null; created_at: string };
type Expense = { id: string; title: string; amount: number; date: string; category: string; created_at: string };
type Salary = { id: string; staff_name: string; designation: string | null; salary_amount: number; payment_date: string; status: string; created_at: string };

const EXPENSE_CATEGORIES = ['General', 'Infrastructure', 'Utilities', 'Supplies', 'Maintenance', 'Events', 'Other'];

export default function AdminFinance() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const now = new Date();
  const { activeCourses } = useCourseStructure();

  // --- Data Queries ---
  const { data: fees = [] } = useQuery<Fee[]>({
    queryKey: ['fees_collection'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fees_collection').select('*').order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Fee[];
    },
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Expense[];
    },
  });

  const { data: salaries = [] } = useQuery<Salary[]>({
    queryKey: ['salaries'],
    queryFn: async () => {
      const { data, error } = await supabase.from('salaries').select('*').order('payment_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Salary[];
    },
  });

  const { data: pendingFeesSetting } = useQuery({
    queryKey: ['pending_fees_setting'],
    queryFn: async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('setting_key', 'pending_fees').single();
      return data;
    },
  });

  // --- Computed ---
  const monthStart = startOfMonth(now).toISOString().split('T')[0];
  const monthEnd = endOfMonth(now).toISOString().split('T')[0];
  const yearStart = startOfYear(now).toISOString().split('T')[0];
  const yearEnd = endOfYear(now).toISOString().split('T')[0];

  const monthlyFees = useMemo(() => fees.filter(f => f.date >= monthStart && f.date <= monthEnd).reduce((s, f) => s + Number(f.amount), 0), [fees, monthStart, monthEnd]);
  const yearlyFees = useMemo(() => fees.filter(f => f.date >= yearStart && f.date <= yearEnd).reduce((s, f) => s + Number(f.amount), 0), [fees, yearStart, yearEnd]);
  const monthlyExpenses = useMemo(() => expenses.filter(e => e.date >= monthStart && e.date <= monthEnd).reduce((s, e) => s + Number(e.amount), 0), [expenses, monthStart, monthEnd]);
  const totalSalariesPaid = useMemo(() => salaries.filter(s => s.status === 'paid').reduce((a, s) => a + Number(s.salary_amount), 0), [salaries]);
  const totalSalariesPending = useMemo(() => salaries.filter(s => s.status === 'unpaid').reduce((a, s) => a + Number(s.salary_amount), 0), [salaries]);
  const pendingFeesAmount = Number(pendingFeesSetting?.setting_value ?? 0);
  const netBalance = monthlyFees - monthlyExpenses - salaries.filter(s => s.status === 'paid' && s.payment_date >= monthStart && s.payment_date <= monthEnd).reduce((a, s) => a + Number(s.salary_amount), 0);

  // Chart data - last 6 months
  const chartData = useMemo(() => {
    const months: { name: string; income: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ms = startOfMonth(d).toISOString().split('T')[0];
      const me = endOfMonth(d).toISOString().split('T')[0];
      months.push({
        name: format(d, 'MMM'),
        income: fees.filter(f => f.date >= ms && f.date <= me).reduce((s, f) => s + Number(f.amount), 0),
        expenses: expenses.filter(e => e.date >= ms && e.date <= me).reduce((s, e) => s + Number(e.amount), 0),
      });
    }
    return months;
  }, [fees, expenses]);

  const chartConfig = { income: { label: 'Income', color: 'hsl(var(--primary))' }, expenses: { label: 'Expenses', color: 'hsl(0 84% 60%)' } };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Monthly Fees" value={monthlyFees} icon={<IndianRupee className="h-5 w-5" />} subtitle={`Yearly: ₹${yearlyFees.toLocaleString('en-IN')}`} />
          <SummaryCard title="Pending Fees" value={pendingFeesAmount} icon={<CircleDollarSign className="h-5 w-5" />} variant="warning" />
          <SummaryCard title="Monthly Expenses" value={monthlyExpenses} icon={<TrendingDown className="h-5 w-5" />} variant="destructive" />
          <SummaryCard title="Net Balance" value={netBalance} icon={<Wallet className="h-5 w-5" />} variant={netBalance >= 0 ? 'success' : 'destructive'} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Income vs Expenses (6 Months)</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Fees Trend (6 Months)</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Salary summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryCard title="Salaries Paid" value={totalSalariesPaid} icon={<TrendingUp className="h-5 w-5" />} variant="success" />
          <SummaryCard title="Salaries Pending" value={totalSalariesPending} icon={<TrendingDown className="h-5 w-5" />} variant="warning" />
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="fees" className="space-y-4">
          <TabsList className="w-full flex flex-wrap h-auto gap-1">
            <TabsTrigger value="fees" className="flex-1 min-w-[100px]">Fees Collection</TabsTrigger>
            <TabsTrigger value="expenses" className="flex-1 min-w-[100px]">Expenses</TabsTrigger>
            <TabsTrigger value="salaries" className="flex-1 min-w-[100px]">Salaries</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 min-w-[100px]">Pending Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="fees"><FeesTab fees={fees} courses={activeCourses} /></TabsContent>
          <TabsContent value="expenses"><ExpensesTab expenses={expenses} /></TabsContent>
          <TabsContent value="salaries"><SalariesTab salaries={salaries} /></TabsContent>
          <TabsContent value="pending"><PendingFeesTab currentValue={pendingFeesAmount} settingId={pendingFeesSetting?.id} /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// --- Summary Card ---
function SummaryCard({ title, value, icon, subtitle, variant = 'default' }: { title: string; value: number; icon: React.ReactNode; subtitle?: string; variant?: string }) {
  const colors: Record<string, string> = {
    default: 'text-primary',
    warning: 'text-yellow-600',
    destructive: 'text-destructive',
    success: 'text-green-600',
  };
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${colors[variant] || colors.default}`}>₹{value.toLocaleString('en-IN')}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full bg-secondary ${colors[variant] || colors.default}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Fees Tab ---
function FeesTab({ fees, courses }: { fees: Fee[]; courses: { id: string; name: string }[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Fee | null>(null);
  const [form, setForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], student_name: '', course: '' });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { amount: Number(form.amount), date: form.date, student_name: form.student_name || null, course: form.course || null };
      if (editItem) {
        const { error } = await supabase.from('fees_collection').update(payload).eq('id', editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('fees_collection').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees_collection'] }); setOpen(false); setEditItem(null); toast({ title: 'Saved' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('fees_collection').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees_collection'] }); toast({ title: 'Deleted' }); },
  });

  const openAdd = () => { setEditItem(null); setForm({ amount: '', date: new Date().toISOString().split('T')[0], student_name: '', course: '' }); setOpen(true); };
  const openEdit = (f: Fee) => { setEditItem(f); setForm({ amount: String(f.amount), date: f.date, student_name: f.student_name ?? '', course: f.course ?? '' }); setOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Fees Collection</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Fee</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Fee Record</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Amount (₹)*</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div><Label>Date*</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div><Label>Student Name</Label><Input value={form.student_name} onChange={e => setForm(p => ({ ...p, student_name: e.target.value }))} /></div>
              <div>
                <Label>Course</Label>
                <Select value={form.course} onValueChange={v => setForm(p => ({ ...p, course: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={!form.amount || saveMutation.isPending}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Student</TableHead><TableHead>Course</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {fees.map(f => (
              <TableRow key={f.id}>
                <TableCell>{f.date}</TableCell>
                <TableCell>{f.student_name || '-'}</TableCell>
                <TableCell>{f.course || '-'}</TableCell>
                <TableCell className="text-right">₹{Number(f.amount).toLocaleString('en-IN')}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {fees.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No fee records yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// --- Expenses Tab ---
function ExpensesTab({ expenses }: { expenses: Expense[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Expense | null>(null);
  const [form, setForm] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'General' });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { title: form.title, amount: Number(form.amount), date: form.date, category: form.category };
      if (editItem) {
        const { error } = await supabase.from('expenses').update(payload).eq('id', editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('expenses').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setOpen(false); setEditItem(null); toast({ title: 'Saved' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('expenses').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast({ title: 'Deleted' }); },
  });

  const openAdd = () => { setEditItem(null); setForm({ title: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'General' }); setOpen(true); };
  const openEdit = (e: Expense) => { setEditItem(e); setForm({ title: e.title, amount: String(e.amount), date: e.date, category: e.category }); setOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Expenses</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Expense</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Expense</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title*</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Amount (₹)*</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div><Label>Date*</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div>
                <Label>Category*</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={!form.title || !form.amount || saveMutation.isPending}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {expenses.map(e => (
              <TableRow key={e.id}>
                <TableCell>{e.date}</TableCell>
                <TableCell>{e.title}</TableCell>
                <TableCell><Badge variant="secondary">{e.category}</Badge></TableCell>
                <TableCell className="text-right">₹{Number(e.amount).toLocaleString('en-IN')}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No expenses yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// --- Salaries Tab ---
function SalariesTab({ salaries }: { salaries: Salary[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Salary | null>(null);
  const [form, setForm] = useState({ staff_name: '', designation: '', salary_amount: '', payment_date: new Date().toISOString().split('T')[0], status: 'unpaid' });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { staff_name: form.staff_name, designation: form.designation || null, salary_amount: Number(form.salary_amount), payment_date: form.payment_date, status: form.status };
      if (editItem) {
        const { error } = await supabase.from('salaries').update(payload).eq('id', editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('salaries').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salaries'] }); setOpen(false); setEditItem(null); toast({ title: 'Saved' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('salaries').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salaries'] }); toast({ title: 'Deleted' }); },
  });

  const toggleStatus = useMutation({
    mutationFn: async (s: Salary) => {
      const { error } = await supabase.from('salaries').update({ status: s.status === 'paid' ? 'unpaid' : 'paid' }).eq('id', s.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salaries'] }); toast({ title: 'Updated' }); },
  });

  const openAdd = () => { setEditItem(null); setForm({ staff_name: '', designation: '', salary_amount: '', payment_date: new Date().toISOString().split('T')[0], status: 'unpaid' }); setOpen(true); };
  const openEdit = (s: Salary) => { setEditItem(s); setForm({ staff_name: s.staff_name, designation: s.designation ?? '', salary_amount: String(s.salary_amount), payment_date: s.payment_date, status: s.status }); setOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Staff Salaries</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Salary</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Salary Record</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Staff Name*</Label><Input value={form.staff_name} onChange={e => setForm(p => ({ ...p, staff_name: e.target.value }))} /></div>
              <div><Label>Designation</Label><Input value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} /></div>
              <div><Label>Salary Amount (₹)*</Label><Input type="number" value={form.salary_amount} onChange={e => setForm(p => ({ ...p, salary_amount: e.target.value }))} /></div>
              <div><Label>Payment Date*</Label><Input type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} /></div>
              <div>
                <Label>Status*</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={!form.staff_name || !form.salary_amount || saveMutation.isPending}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Staff</TableHead><TableHead>Designation</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {salaries.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.payment_date}</TableCell>
                <TableCell>{s.staff_name}</TableCell>
                <TableCell>{s.designation || '-'}</TableCell>
                <TableCell className="text-right">₹{Number(s.salary_amount).toLocaleString('en-IN')}</TableCell>
                <TableCell>
                  <Badge
                    className="cursor-pointer"
                    variant={s.status === 'paid' ? 'default' : 'destructive'}
                    onClick={() => toggleStatus.mutate(s)}
                  >
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {salaries.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No salary records yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// --- Pending Fees Tab ---
function PendingFeesTab({ currentValue, settingId }: { currentValue: number; settingId?: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [value, setValue] = useState(String(currentValue));

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!settingId) return;
      const { error } = await supabase.from('site_settings').update({ setting_value: value }).eq('id', settingId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pending_fees_setting'] }); toast({ title: 'Updated' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Update Pending Fees</CardTitle></CardHeader>
      <CardContent className="space-y-4 max-w-md">
        <div><Label>Pending Fees Amount (₹)</Label><Input type="number" value={value} onChange={e => setValue(e.target.value)} /></div>
        <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>Save</Button>
      </CardContent>
    </Card>
  );
}
