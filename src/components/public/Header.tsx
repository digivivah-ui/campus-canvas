import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/departments', label: 'Departments' },
  { href: '/faculty', label: 'Faculty' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container-college">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-lg font-bold text-primary leading-tight">
                MGCM
              </h1>
              <p className="text-xs text-muted-foreground">Ashta, Sehore</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors link-underline',
                  location.pathname === link.href
                    ? 'text-primary bg-secondary'
                    : 'text-muted-foreground hover:text-primary hover:bg-secondary/50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Admin Link & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link to="/admin" className="hidden sm:block">
              <Button variant="outline" size="sm">
                Admin Portal
              </Button>
            </Link>

            <button
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-border animate-fade-in">
            <nav className="py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === link.href
                      ? 'text-primary bg-secondary'
                      : 'text-muted-foreground hover:text-primary hover:bg-secondary/50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-accent hover:bg-secondary/50 rounded-lg"
              >
                Admin Portal
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
