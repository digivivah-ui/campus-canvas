import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { HeroSection } from '@/components/public/HeroSection';
import { StatsSection } from '@/components/public/StatsSection';
import { DepartmentCard } from '@/components/public/DepartmentCard';
import { EventsCarousel } from '@/components/public/EventsCarousel';
import { AutoScrollImages } from '@/components/public/AutoScrollImages';
import { MembersCarousel } from '@/components/public/MembersCarousel';
import { Button } from '@/components/ui/button';
import { getDepartments } from '@/services/api';
import type { Department } from '@/types/database';
import { CardSkeleton } from '@/components/common/Skeleton';

const Index = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDepartments()
      .then((data) => setDepartments(data.slice(0, 4)))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Auto-scroll Images */}
      <AutoScrollImages />

      {/* Leadership Section */}
      <MembersCarousel />

      {/* Featured Departments */}
      <section className="section-padding bg-background">
        <div className="container-college">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Departments
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our diverse range of academic programs designed to prepare you for success in the dynamic business world.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {departments.map((dept, index) => (
                <DepartmentCard key={dept.id} department={dept} index={index} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/departments">
              <Button variant="outline" size="lg" className="group">
                View All Departments
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container-college">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Upcoming Events
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest happenings at MGCM.
            </p>
          </motion.div>

          <EventsCarousel />

          <div className="text-center mt-10">
            <Link to="/events">
              <Button variant="outline" size="lg" className="group">
                View All Events
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary">
        <div className="container-college text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              Join thousands of successful alumni who have transformed their lives through quality management education at MGCM.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold">
                  Apply Now
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
