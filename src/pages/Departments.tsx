 import { useEffect, useState } from 'react';
 import { motion } from 'framer-motion';
 import { PublicLayout } from '@/layouts/PublicLayout';
 import { DepartmentCard } from '@/components/public/DepartmentCard';
 import { getDepartments } from '@/services/api';
 import type { Department } from '@/types/database';
 import { CardSkeleton } from '@/components/common/Skeleton';
 
 export default function Departments() {
   const [departments, setDepartments] = useState<Department[]>([]);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     getDepartments()
       .then(setDepartments)
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
               Academic Departments
             </h1>
             <p className="text-xl text-primary-foreground/80">
               Explore our diverse range of academic programs designed to prepare you
               for a successful career in your chosen field.
             </p>
           </motion.div>
         </div>
       </section>
 
       {/* Departments Grid */}
       <section className="section-padding">
         <div className="container-college">
           {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[...Array(6)].map((_, i) => (
                 <CardSkeleton key={i} />
               ))}
             </div>
           ) : departments.length === 0 ? (
             <div className="text-center py-20">
               <p className="text-muted-foreground text-lg">No departments available yet.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {departments.map((dept, index) => (
                 <DepartmentCard key={dept.id} department={dept} index={index} />
               ))}
             </div>
           )}
         </div>
       </section>
     </PublicLayout>
   );
 }