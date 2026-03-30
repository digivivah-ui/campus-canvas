 import { ReactNode, useEffect } from 'react';
 import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Home,
    FileText,
    Building2,
    Users,
    Calendar,
    Image,
    MessageSquare,
    LogOut,
    GraduationCap,
    Menu,
    Settings,
    BarChart3,
    Globe,
    Video,
    BookOpen,
    IndianRupee,
    PieChart,
    UserCheck,
  } from 'lucide-react';
 import { useAuth } from '@/hooks/useAuth';
 import { Button } from '@/components/ui/button';
 import { PageLoader } from '@/components/common/LoadingSpinner';
 import { cn } from '@/lib/utils';
 import { useState } from 'react';
 
 interface AdminLayoutProps {
   children: ReactNode;
 }
 
const navItems = [
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
  { href: '/admin/course-structure', label: 'Course Structure', icon: GraduationCap },
  { href: '/admin/students', label: 'Students', icon: UserCheck },
  { href: '/admin/finance', label: 'Finance', icon: IndianRupee },
  { href: '/admin/analytics', label: 'Analytics', icon: PieChart },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
];
 
 export function AdminLayout({ children }: AdminLayoutProps) {
   const { user, isAdmin, isLoading, signOut } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();
   const [sidebarOpen, setSidebarOpen] = useState(false);
 
   useEffect(() => {
     if (!isLoading && !user) {
       navigate('/admin');
     }
   }, [user, isLoading, navigate]);
 
   if (isLoading) {
     return <PageLoader />;
   }
 
   if (!user) {
     return null;
   }
 
   const handleSignOut = async () => {
     await signOut();
     navigate('/admin');
   };
 
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
           <div className="p-6 border-b border-primary-foreground/20">
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
 
           {/* Navigation */}
           <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
             {navItems.map((item) => (
               <Link
                 key={item.href}
                 to={item.href}
                 onClick={() => setSidebarOpen(false)}
                 className={cn(
                   'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                   location.pathname === item.href
                     ? 'bg-accent text-accent-foreground'
                     : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                 )}
               >
                 <item.icon className="h-5 w-5" />
                 {item.label}
               </Link>
             ))}
           </nav>
 
           {/* User & Logout */}
           <div className="p-4 border-t border-primary-foreground/20">
             <div className="mb-4 px-4">
               <p className="text-sm font-medium text-primary-foreground truncate">
                 {user.email}
               </p>
               <p className="text-xs text-primary-foreground/60">
                 {isAdmin ? 'Administrator' : 'User'}
               </p>
             </div>
             <Button
               variant="outline"
               className="bg-accent text-accent-foreground shadow-gold hover:bg-yellow-200"
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
         <div
           className="fixed inset-0 bg-primary/50 z-40 lg:hidden"
           onClick={() => setSidebarOpen(false)}
         />
       )}
 
       {/* Main Content */}
       <div className="flex-1 flex flex-col min-w-0">
         {/* Top Bar */}
         <header className="sticky top-0 z-30 bg-background border-b border-border px-6 py-4 flex items-center gap-4">
           <button
             className="lg:hidden p-2 rounded-lg hover:bg-secondary"
             onClick={() => setSidebarOpen(true)}
           >
             <Menu className="h-6 w-6" />
           </button>
           <h1 className="font-display text-xl font-semibold text-foreground">
             {navItems.find((item) => item.href === location.pathname)?.label || 'Admin'}
           </h1>
         </header>
 
         {/* Content */}
         <main className="flex-1 p-6 overflow-y-auto">{children}</main>
       </div>
     </div>
   );
 }