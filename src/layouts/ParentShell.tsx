import { Outlet } from 'react-router-dom';
import { Home, IndianRupee, Receipt, CalendarCheck, Bell, Award } from 'lucide-react';
import { RequireRole } from '@/components/RequireRole';
import { PortalLayout } from '@/layouts/PortalLayout';
import { ParentProvider, useParentCtx } from '@/contexts/ParentContext';

const navItems = [
  { to: '/parent/dashboard', label: 'Home', icon: Home },
  { to: '/parent/fees', label: 'Fees', icon: IndianRupee },
  { to: '/parent/attendance', label: 'Attend', icon: CalendarCheck },
  { to: '/parent/results', label: 'Results', icon: Award },
  { to: '/parent/notices', label: 'Notices', icon: Bell },
];

function Inner() {
  const { selected } = useParentCtx();
  return (
    <PortalLayout
      title="Parent Portal"
      subtitle={selected ? selected.name : 'Welcome'}
      loginPath="/parent/login"
      navItems={navItems}
      accent="parent"
    >
      <Outlet />
    </PortalLayout>
  );
}

export default function ParentShell() {
  return (
    <RequireRole role="parent" loginPath="/parent/login">
      <ParentProvider>
        <Inner />
      </ParentProvider>
    </RequireRole>
  );
}
