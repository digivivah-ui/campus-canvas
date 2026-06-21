import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Home, FileText, Building2, Users, Calendar, Image, MessageSquare, LogOut,
  GraduationCap, Menu, Settings, BarChart3, Globe, Video, BookOpen,
  IndianRupee, PieChart, UserCheck, AlertTriangle, ChevronDown, ChevronRight, School,
  CalendarCheck, ClipboardList, Award, Bell, Megaphone, Briefcase, UserPlus,
  Bus, IdCard, FileCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { roleHome } from '@/lib/roleRoutes';

interface AdminLayoutProps {
  children: ReactNode;
}

type NavItem = { href: string; label: string; icon: any };
type NavGroup = { id: string; label: string; icon: any; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    id: 'website',
    label: 'Website',
    icon: Globe,
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
      { href: '/admin/settings', label: 'Site Settings', icon: Settings },
      { href: '/admin/homepage', label: 'Homepage', icon: FileText },
      { href: '/admin/about', label: 'About', icon: FileText },
      { href: '/admin/stats', label: 'Statistics', icon: BarChart3 },
      { href: '/admin/departments', label: 'Departments', icon: Building2 },
      { href: '/admin/members', label: 'Members', icon: Users },
      { href: '/admin/faculty', label: 'Faculty', icon: Users },
      { href: '/admin/events', label: 'Events', icon: Calendar },
      { href: '/admin/gallery', label: 'Gallery', icon: Image },
      { href: '/admin/social-links', label: 'Social Links', icon: Globe },
      { href: '/admin/explore-videos', label: 'Explore Videos', icon: Video },
      { href: '/admin/programs', label: 'Programs', icon: BookOpen },
    ],
  },
  {
    id: 'school',
    label: 'School ERP',
    icon: School,
    items: [
      { href: '/admin/course-structure', label: 'Course Structure', icon: GraduationCap },
      { href: '/admin/students', label: 'Students', icon: UserCheck },
      { href: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
      { href: '/admin/exams', label: 'Exams', icon: ClipboardList },
      { href: '/admin/results', label: 'Results', icon: Award },
      { href: '/admin/finance', label: 'Finance', icon: IndianRupee },
      { href: '/admin/analytics', label: 'Analytics', icon: PieChart },
      { href: '/admin/defaulters', label: 'Defaulters', icon: AlertTriangle },
      { href: '/admin/transport', label: 'Transport', icon: Bus },
      { href: '/admin/id-cards', label: 'ID Cards', icon: IdCard },
      { href: '/admin/certificates', label: 'Certificates', icon: FileCheck },
    ],
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: Briefcase,
    items: [
      { href: '/admin/staff', label: 'Staff Directory', icon: Users },
      { href: '/admin/teacher-assignments', label: 'Teacher Assignments', icon: UserPlus },
      { href: '/admin/staff-attendance', label: 'Staff Attendance', icon: CalendarCheck },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: MessageSquare,
    items: [
      { href: '/admin/notices', label: 'Notices', icon: Bell },
      { href: '/admin/homework', label: 'Homework', icon: BookOpen },
      { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
      { href: '/admin/notifications', label: 'Notifications', icon: MessageSquare },
      { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    ],
  },
];

const allItems = navGroups.flatMap(g => g.items);

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const { role, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-open the group containing the active route
  const activeGroupId = navGroups.find(g => g.items.some(i => i.href === location.pathname))?.id;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('admin_open_groups') : null;
    if (stored) try { return JSON.parse(stored); } catch {}
    return { website: true, school: true, communication: true };
  });

  useEffect(() => {
    if (activeGroupId && !openGroups[activeGroupId]) {
      setOpenGroups(p => ({ ...p, [activeGroupId]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroupId]);

  useEffect(() => {
    localStorage.setItem('admin_open_groups', JSON.stringify(openGroups));
  }, [openGroups]);

  useEffect(() => {
    if (!isLoading && !user) navigate('/admin');
  }, [user, isLoading, navigate]);

  if (isLoading || roleLoading) return <PageLoader />;
  if (!user) return null;
  // Strict role isolation: non-admin authenticated users must not see the admin shell.
  if (role && role !== 'admin') return <Navigate to={roleHome(role)} replace />;
  if (!isAdmin) return <Navigate to="/admin" replace />;

  const handleSignOut = async () => { await signOut(); navigate('/admin'); };
  const toggleGroup = (id: string) => setOpenGroups(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-primary transform transition-transform duration-300 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-primary-foreground/20">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-accent p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h2 className="font-display font-bold text-primary-foreground">Admin Panel</h2>
                <p className="text-xs text-primary-foreground/60">MGCM, Ashta</p>
              </div>
            </Link>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
            {navGroups.map(group => {
              const isOpen = !!openGroups[group.id];
              const hasActive = group.items.some(i => i.href === location.pathname);
              return (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors',
                      hasActive ? 'text-primary-foreground' : 'text-primary-foreground/60 hover:text-primary-foreground'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <group.icon className="h-3.5 w-3.5" />
                      {group.label}
                    </span>
                    {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                  {isOpen && (
                    <div className="mt-1 space-y-0.5">
                      {group.items.map(item => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 ml-2 rounded-md text-sm font-medium transition-colors',
                            location.pathname === item.href
                              ? 'bg-accent text-accent-foreground shadow-sm'
                              : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-primary-foreground/20">
            <div className="mb-3 px-2">
              <p className="text-sm font-medium text-primary-foreground truncate">{user.email}</p>
              <p className="text-xs text-primary-foreground/60">{isAdmin ? 'Administrator' : 'User'}</p>
            </div>
            <Button
              variant="outline"
              className="w-full bg-accent text-accent-foreground shadow-gold hover:bg-yellow-200"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-primary/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background border-b border-border px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-secondary" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-display text-xl font-semibold text-foreground">
            {allItems.find(item => item.href === location.pathname)?.label || 'Admin'}
          </h1>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
