 import { useEffect, useState } from 'react';
 import { motion } from 'framer-motion';
 import { Target, Eye, History, Award, Users, BookOpen } from 'lucide-react';
 import { PublicLayout } from '@/layouts/PublicLayout';
 import { getAboutSections, getStats } from '@/services/api';
 import type { AboutSection, Stat } from '@/types/database';
 import { Skeleton } from '@/components/common/Skeleton';
 
 const iconMap: Record<string, typeof Target> = {
   vision: Eye,
   mission: Target,
   history: History,
 };
 
 export default function About() {
   const [sections, setSections] = useState<AboutSection[]>([]);
   const [stats, setStats] = useState<Stat[]>([]);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     Promise.all([getAboutSections(), getStats()])
       .then(([aboutData, statsData]) => {
         setSections(aboutData);
         setStats(statsData);
       })
       .catch(console.error)
       .finally(() => setIsLoading(false));
   }, []);
 
   return (
     <PublicLayout>
       {/* Hero */}
       <section className="py-20 bg-gradient-hero text-primary-foreground">
         <div className="container-college">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="max-w-3xl"
           >
             <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
               About Apex University
             </h1>
             <p className="text-xl text-primary-foreground/80">
               For over five decades, we have been committed to academic excellence,
               innovative research, and creating leaders who make a difference in the world.
             </p>
           </motion.div>
         </div>
       </section>
 
       {/* Sections */}
       <section className="section-padding">
         <div className="container-college">
           {isLoading ? (
             <div className="space-y-16">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="flex gap-8 items-center">
                   <Skeleton className="w-16 h-16 rounded-xl" />
                   <div className="flex-1 space-y-4">
                     <Skeleton className="h-8 w-48" />
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-3/4" />
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="space-y-16">
               {sections.map((section, index) => {
                 const Icon = iconMap[section.section_key] || Target;
                 const isEven = index % 2 === 0;
                 
                 return (
                   <motion.div
                     key={section.id}
                     initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.6 }}
                     className={`flex flex-col md:flex-row gap-8 items-center ${
                       isEven ? '' : 'md:flex-row-reverse'
                     }`}
                   >
                     <div className="flex-shrink-0">
                       <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                         <Icon className="w-10 h-10 text-primary" />
                       </div>
                     </div>
                     <div className="flex-1 text-center md:text-left">
                       <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                         {section.title}
                       </h2>
                       <p className="text-muted-foreground text-lg leading-relaxed">
                         {section.content}
                       </p>
                     </div>
                   </motion.div>
                 );
               })}
             </div>
           )}
         </div>
       </section>
 
       {/* Stats */}
       <section className="py-20 bg-primary">
         <div className="container-college">
           <motion.h2
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="font-display text-3xl md:text-4xl font-bold text-primary-foreground text-center mb-12"
           >
             Apex by the Numbers
           </motion.h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             {stats.map((stat, index) => (
               <motion.div
                 key={stat.id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.1 }}
                 className="text-center"
               >
                 <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                   {stat.value}
                 </div>
                 <div className="text-primary-foreground/80">{stat.label}</div>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       {/* Values */}
       <section className="section-padding bg-secondary/30">
         <div className="container-college">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-12"
           >
             <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
               Our Core Values
             </h2>
           </motion.div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { icon: Award, title: 'Excellence', desc: 'Striving for the highest standards in education and research.' },
               { icon: Users, title: 'Community', desc: 'Fostering a supportive and inclusive environment for all.' },
               { icon: BookOpen, title: 'Innovation', desc: 'Embracing new ideas and technologies to advance knowledge.' },
             ].map((value, index) => (
               <motion.div
                 key={value.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.1 }}
                 className="text-center p-8 bg-card rounded-2xl border border-border hover:shadow-college-lg transition-shadow"
               >
                 <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                   <value.icon className="w-8 h-8 text-primary" />
                 </div>
                 <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                   {value.title}
                 </h3>
                 <p className="text-muted-foreground">{value.desc}</p>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
     </PublicLayout>
   );
 }