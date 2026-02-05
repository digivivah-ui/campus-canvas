 import { useEffect, useState } from 'react';
 import { Link } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { ArrowRight, ChevronDown } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { getHomepageContent } from '@/services/api';
 import type { HomepageContent } from '@/types/database';
 import { HeroSkeleton } from '@/components/common/Skeleton';
 
 export function HeroSection() {
   const [content, setContent] = useState<HomepageContent | null>(null);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     getHomepageContent()
       .then((data) => {
         const hero = data.find((item) => item.section_key === 'hero');
         setContent(hero || null);
       })
       .catch(console.error)
       .finally(() => setIsLoading(false));
   }, []);
 
   if (isLoading) return <HeroSkeleton />;
 
   return (
     <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-hero">
       {/* Background Pattern */}
       <div className="absolute inset-0 opacity-10">
         <div className="absolute inset-0" style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
         }} />
       </div>
 
       {/* Floating Shapes */}
       <motion.div
         className="absolute top-20 right-20 w-64 h-64 rounded-full bg-accent/20 blur-3xl"
         animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
       />
       <motion.div
         className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl"
         animate={{ y: [0, 20, 0], scale: [1, 0.9, 1] }}
         transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
       />
 
       <div className="container-college relative z-10">
         <div className="max-w-4xl">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
             <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6">
               🎓 Admissions Open 2025
             </span>
           </motion.div>
 
           <motion.h1
             className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight"
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.1 }}
           >
             {content?.title || 'Welcome to Apex University'}
           </motion.h1>
 
           <motion.p
             className="text-xl md:text-2xl text-primary-foreground/80 mb-4 font-display"
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
           >
             {content?.subtitle || 'Shaping Tomorrow\'s Leaders Today'}
           </motion.p>
 
           <motion.p
             className="text-lg text-primary-foreground/70 mb-10 max-w-2xl"
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.3 }}
           >
             {content?.content || 'Discover world-class education, cutting-edge research, and a vibrant campus community.'}
           </motion.p>
 
           <motion.div
             className="flex flex-wrap gap-4"
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4 }}
           >
             <Link to={content?.cta_link || '/departments'}>
               <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold group">
                 {content?.cta_text || 'Explore Programs'}
                 <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
               </Button>
             </Link>
             <Link to="/contact">
               <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                 Contact Us
               </Button>
             </Link>
           </motion.div>
         </div>
       </div>
 
       {/* Scroll Indicator */}
       <motion.div
         className="absolute bottom-8 left-1/2 -translate-x-1/2"
         animate={{ y: [0, 10, 0] }}
         transition={{ duration: 2, repeat: Infinity }}
       >
         <ChevronDown className="h-8 w-8 text-primary-foreground/50" />
       </motion.div>
     </section>
   );
 }