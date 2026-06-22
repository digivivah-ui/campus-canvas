import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, LogOut as ExitIcon, Search, Trash2, UserCircle } from 'lucide-react';

export default function AdminVisitors() {
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [page, setPage] = useState(0);
  const PAGE = 20;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ visitor_name: '', phone: '', purpose: '', remarks: '' });

  const load = async () => {
    const { data } = await (supabase as any).from('visitors').select('*, students(name,admission_number)')
      .gte('entry_time', `${from}T00:00:00`).lte('entry_time', `${to}T23:59:59`)
      .order('entry_time', { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [from, to]);

  const filtered = useMemo(() => rows.filter(r => {
    if (!q) return true;
    const s = q.toLowerCase();
    return r.visitor_name?.toLowerCase().includes(s) || r.phone?.includes(s) || r.purpose?.toLowerCase().includes(s);
  }), [rows, q]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const view = filtered.slice(page * PAGE, page * PAGE + PAGE);

  const create = async () => {
    if (!form.visitor_name) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    const { error } = await (supabase as any).from('visitors').insert([{ ...form, entry_time: new Date().toISOString() }]);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Visitor checked in' }); setOpen(false); setForm({ visitor_name: '', phone: '', purpose: '', remarks: '' }); load(); }
  };
  const checkout = async (id: string) => { await (supabase as any).from('visitors').update({ exit_time: new Date().toISOString() }).eq('id', id); load(); };
  const del = async (id: string) => { await (supabase as any).from('visitors').delete().eq('id', id); load(); };

  const inside = rows.filter(r => !r.exit_time).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Visitors</h1>
            <p className="text-muted-foreground">Visitor log book with entry & exit times.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Check In</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Visitor</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={form.visitor_name} onChange={e => setForm({ ...form, visitor_name: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Purpose</Label><Input value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} /></div>
                <div><Label>Remarks</Label><Textarea value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
                <Button onClick={create} className="w-full">Check In</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{rows.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Currently inside</p><p className="text-2xl font-bold text-emerald-600">{inside}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Checked out</p><p className="text-2xl font-bold text-muted-foreground">{rows.length - inside}</p></CardContent></Card>
        </div>

        <Card><CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Search</label>
            <div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} className="pl-8" placeholder="Name, phone, purpose" />
            </div>
          </div>
          <div><label className="text-xs text-muted-foreground">From</label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">To</label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
        </CardContent></Card>

        <div className="space-y-2">
          {view.length === 0 && <Card><CardContent className="p-8 text-center text-muted-foreground">No visitors in range.</CardContent></Card>}
          {view.map(r => (
            <Card key={r.id}><CardContent className="p-4 flex flex-wrap gap-3 items-start justify-between">
              <div className="min-w-0 flex gap-3">
                <UserCircle className="h-10 w-10 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-semibold">{r.visitor_name}</p>
                  <p className="text-xs text-muted-foreground">{r.phone} · {r.purpose}</p>
                  <p className="text-[11px] mt-1">In: {new Date(r.entry_time).toLocaleString()}{r.exit_time && ` · Out: ${new Date(r.exit_time).toLocaleString()}`}</p>
                  {r.remarks && <p className="text-xs mt-1">{r.remarks}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                {!r.exit_time && <Button size="sm" variant="outline" onClick={() => checkout(r.id)}><ExitIcon className="h-4 w-4 mr-1" />Check Out</Button>}
                <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
              </div>
            </CardContent></Card>
          ))}
        </div>

        {pages > 1 && (
          <div className="flex justify-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span className="text-sm py-1.5">Page {page + 1} / {pages}</span>
            <Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
