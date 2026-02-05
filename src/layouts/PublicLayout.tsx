 import { ReactNode } from 'react';
 import { Header } from '@/components/public/Header';
 import { Footer } from '@/components/public/Footer';
 
 interface PublicLayoutProps {
   children: ReactNode;
 }
 
 export function PublicLayout({ children }: PublicLayoutProps) {
   return (
     <div className="min-h-screen flex flex-col">
       <Header />
       <main className="flex-1">{children}</main>
       <Footer />
     </div>
   );
 }