 import { useEffect, useState } from 'react';
 import { motion } from 'framer-motion';
 import { Users, GraduationCap, BookOpen, Award } from 'lucide-react';
 import { getStats } from '@/services/api';
 import type { Stat } from '@/types/database';
 import { StatsSkeleton } from '@/components/common/Skeleton';
 import { useScrollReveal } from '@/hooks/useScrollReveal';
 
 const iconMap: Record<string, typeof Users> = {
   users: Users,
   'graduation-cap': GraduationCap,
   'book-open': BookOpen,
   award: Award,
 };
 
 export function StatsSection() {
   const [stats, setStats] = useState<Stat[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
 
   useEffect(() => {
     getStats()
       .then(setStats)
       .catch(console.error)
       .finally(() => setIsLoading(false));
   }, []);
 
   if (isLoading) {
     return (
       <section className="py-16 bg-secondary">
         <div className="container-college">
           <StatsSkeleton />
         </div>
       </section>
     );
   }
 
   return (
     <section ref={ref} className="py-20 bg-gradient-to-b from-secondary to-background">
       <div className="container-college">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {stats.map((stat, index) => {
             const Icon = iconMap[stat.icon || 'award'] || Award;
             return (
               <motion.div
                 key={stat.id}
                 className="text-center group"
                 initial={{ opacity: 0, y: 30 }}
                 animate={isVisible ? { opacity: 1, y: 0 } : {}}
                 transition={{ duration: 0.5, delay: index * 0.1 }}
               >
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                   <Icon className="h-8 w-8" />
                 </div>
                 <h3 className="font-display text-4xl font-bold text-primary mb-2">
                   {stat.value}
                 </h3>
                 <p className="text-muted-foreground font-medium">{stat.label}</p>
               </motion.div>
             );
           })}
         </div>
       </div>
     </section>
   );
 }