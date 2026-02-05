 import { Link } from 'react-router-dom';
 import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
 
 export function Footer() {
   return (
     <footer className="bg-primary text-primary-foreground">
       <div className="container-college py-16">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
           {/* Brand */}
           <div className="space-y-4">
             <Link to="/" className="flex items-center gap-3">
               <div className="bg-accent p-2 rounded-lg">
                 <GraduationCap className="h-8 w-8 text-accent-foreground" />
               </div>
               <div>
                 <h3 className="font-display text-xl font-bold">Apex University</h3>
                 <p className="text-sm opacity-80">Excellence in Education</p>
               </div>
             </Link>
             <p className="text-sm opacity-80 leading-relaxed">
               Empowering students with knowledge, skills, and values to become leaders of tomorrow.
             </p>
           </div>
 
           {/* Quick Links */}
           <div>
             <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
             <ul className="space-y-3">
               {[
                 { href: '/about', label: 'About Us' },
                 { href: '/departments', label: 'Departments' },
                 { href: '/faculty', label: 'Faculty' },
                 { href: '/events', label: 'Events' },
                 { href: '/gallery', label: 'Gallery' },
                 { href: '/contact', label: 'Contact' },
               ].map((link) => (
                 <li key={link.href}>
                   <Link
                     to={link.href}
                     className="text-sm opacity-80 hover:opacity-100 hover:text-accent transition-colors"
                   >
                     {link.label}
                   </Link>
                 </li>
               ))}
             </ul>
           </div>
 
           {/* Contact Info */}
           <div>
             <h4 className="font-display text-lg font-semibold mb-4">Contact Us</h4>
             <ul className="space-y-3">
               <li className="flex items-start gap-3">
                 <MapPin className="h-5 w-5 mt-0.5 text-accent" />
                 <span className="text-sm opacity-80">
                   123 University Avenue,<br />
                   Academic City, AC 12345
                 </span>
               </li>
               <li className="flex items-center gap-3">
                 <Phone className="h-5 w-5 text-accent" />
                 <span className="text-sm opacity-80">+1 (555) 123-4567</span>
               </li>
               <li className="flex items-center gap-3">
                 <Mail className="h-5 w-5 text-accent" />
                 <span className="text-sm opacity-80">info@apexuniversity.edu</span>
               </li>
             </ul>
           </div>
 
           {/* Social Links */}
           <div>
             <h4 className="font-display text-lg font-semibold mb-4">Follow Us</h4>
             <div className="flex gap-3">
               {[
                 { icon: Facebook, label: 'Facebook' },
                 { icon: Twitter, label: 'Twitter' },
                 { icon: Instagram, label: 'Instagram' },
                 { icon: Linkedin, label: 'LinkedIn' },
               ].map((social) => (
                 <a
                   key={social.label}
                   href="#"
                   className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors"
                   aria-label={social.label}
                 >
                   <social.icon className="h-5 w-5" />
                 </a>
               ))}
             </div>
             <div className="mt-6">
               <h5 className="font-medium mb-2">Subscribe to Newsletter</h5>
               <div className="flex gap-2">
                 <input
                   type="email"
                   placeholder="Your email"
                   className="flex-1 px-3 py-2 rounded-lg bg-primary-foreground/10 text-sm placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent"
                 />
                 <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                   Subscribe
                 </button>
               </div>
             </div>
           </div>
         </div>
 
         <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-sm opacity-70">
             © {new Date().getFullYear()} Apex University. All rights reserved.
           </p>
           <div className="flex gap-6">
             <a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Privacy Policy</a>
             <a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Terms of Service</a>
           </div>
         </div>
       </div>
     </footer>
   );
 }