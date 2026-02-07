import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-college py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-accent p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold leading-tight">
                  Mahatma Gandhi<br />Mahavidhyala Ashta
                </h3>
              </div>
            </Link>
            <p className="text-sm opacity-80 leading-relaxed">
              Affiliated to Barkatullah University, Bhopal. Empowering students with knowledge, skills, and values since 1995.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: '/#about', label: 'About Us' },
                { href: '/departments', label: 'Departments' },
                { href: '/faculty', label: 'Faculty' },
                { href: '/events', label: 'Events' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm opacity-80 active:opacity-100 active:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://bubhopal.ac.in/1068/Home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm opacity-80 active:opacity-100 active:text-accent transition-colors"
                >
                  Barkatullah University →
                </a>
              </li>
              <li>
                <a
                  href="https://bubhopal.mponline.gov.in/Portal/Services/BARKATULLAH/Counterbase/Result/VeiwResult_NEP.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm opacity-80 active:opacity-100 active:text-accent transition-colors"
                >
                  Check Results →
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-accent flex-shrink-0" />
                <span className="text-sm opacity-80">
                  Near Mukharji Ground,<br />
                  Kannod Road, Ashta,<br />
                  District Sehore,<br />
                  Madhya Pradesh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent" />
                <span className="text-sm opacity-80">+91 7562-222XXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent" />
                <span className="text-sm opacity-80">info@mgmahavidhyala.ac.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-10 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-70 text-center md:text-left">
            © {new Date().getFullYear()} Mahatma Gandhi Mahavidhyala, Ashta. All rights reserved.
          </p>
          <p className="text-xs opacity-50">
            Affiliated to Barkatullah University, Bhopal
          </p>
        </div>
      </div>
    </footer>
  );
}
