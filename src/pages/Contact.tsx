 import { motion } from 'framer-motion';
 import { MapPin, Phone, Mail, Clock } from 'lucide-react';
 import { PublicLayout } from '@/layouts/PublicLayout';
 import { ContactForm } from '@/components/public/ContactForm';
 
 export default function Contact() {
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
               Contact Us
             </h1>
             <p className="text-xl text-primary-foreground/80">
               Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
             </p>
           </motion.div>
         </div>
       </section>
 
       {/* Contact Section */}
       <section className="section-padding">
         <div className="container-college">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             {/* Contact Info */}
             <motion.div
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5 }}
               className="lg:col-span-1"
             >
               <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                 Get in Touch
               </h2>
               <div className="space-y-6">
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                     <MapPin className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-foreground mb-1">Address</h3>
                     <p className="text-muted-foreground">
                       123 University Avenue,<br />
                       Academic City, AC 12345
                     </p>
                   </div>
                 </div>
 
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                     <Phone className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                     <p className="text-muted-foreground">
                       Main: +1 (555) 123-4567<br />
                       Admissions: +1 (555) 123-4568
                     </p>
                   </div>
                 </div>
 
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                     <Mail className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-foreground mb-1">Email</h3>
                     <p className="text-muted-foreground">
                       info@apexuniversity.edu<br />
                       admissions@apexuniversity.edu
                     </p>
                   </div>
                 </div>
 
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                     <Clock className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-foreground mb-1">Office Hours</h3>
                     <p className="text-muted-foreground">
                       Mon - Fri: 8:00 AM - 5:00 PM<br />
                       Sat: 9:00 AM - 1:00 PM
                     </p>
                   </div>
                 </div>
               </div>
             </motion.div>
 
             {/* Contact Form */}
             <motion.div
               initial={{ opacity: 0, x: 30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5, delay: 0.2 }}
               className="lg:col-span-2"
             >
               <div className="bg-card rounded-2xl border border-border p-8">
                 <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                   Send us a Message
                 </h2>
                 <ContactForm />
               </div>
             </motion.div>
           </div>
         </div>
       </section>
 
       {/* Map Section */}
       <section className="h-96 bg-secondary">
         <div className="w-full h-full flex items-center justify-center">
           <div className="text-center">
             <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
             <p className="text-muted-foreground">Map integration coming soon</p>
           </div>
         </div>
       </section>
     </PublicLayout>
   );
 }