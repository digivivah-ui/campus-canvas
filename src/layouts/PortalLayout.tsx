import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  loginPath: string;
}

export function PortalLayout({ title, subtitle, children, loginPath }: Props) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => { await signOut(); navigate(loginPath); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/[0.04] via-background to-primary/[0.06]">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-accent p-2 rounded-lg shrink-0">
              <GraduationCap className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-base truncate">{title}</h1>
              {subtitle && <p className="text-xs text-primary-foreground/70 truncate">{subtitle}</p>}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleSignOut} className="bg-accent text-accent-foreground hover:bg-yellow-200 border-0">
            <LogOut className="h-4 w-4 mr-1.5" /> Exit
          </Button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-5 pb-16 space-y-4">{children}</main>
    </div>
  );
}
