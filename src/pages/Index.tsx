import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { HeroSection } from '@/components/public/HeroSection';
import { CollegePhotoSection } from '@/components/public/CollegePhotoSection';
import { StatsSection } from '@/components/public/StatsSection';
import { AboutSection } from '@/components/public/AboutSection';
import { DepartmentCard } from '@/components/public/DepartmentCard';
import { EventsCarousel } from '@/components/public/EventsCarousel';
import { AutoScrollImages } from '@/components/public/AutoScrollImages';
import { MembersCarousel } from '@/components/public/MembersCarousel';
import { ExploreCampusSection } from '@/components/public/ExploreCampusSection';
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

      {/* College Photo Section */}
      <CollegePhotoSection />

      {/* Stats Section */}
      <StatsSection />

      {/* About College (merged from About page) */}
      <AboutSection />

      {/* Auto-scroll Images */}
      <AutoScrollImages />

      {/* Leadership Section */}
      <MembersCarousel />

      {/* Featured Departments */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container-college">
          <motion.div
            className="text-center mb-10 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Departments
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our diverse range of academic programs in Arts, Science, and Commerce.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {departments.map((dept, index) => (
                <DepartmentCard key={dept.id} department={dept} index={index} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:mt-10">
            <Link to="/departments">
              <Button variant="outline" size="lg">
                View All Departments
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Explore Campus (YouTube videos) */}
      <ExploreCampusSection />

      {/* Events Section */}
      <section className="py-12 md:py-20 bg-muted/40">
        <div className="container-college">
          <motion.div
            className="text-center mb-10 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Upcoming Events
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest happenings at MG Mahavidhyala.
            </p>
          </motion.div>

          <EventsCarousel />

          <div className="text-center mt-8 md:mt-10">
            <Link to="/events">
              <Button variant="outline" size="lg">
                View All Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-primary">
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
            <p className="text-primary-foreground/80 mb-6 md:mb-8 text-base md:text-lg">
              Join our vibrant academic community at Mahatma Gandhi Mahavidhyala Ashta. 
              Quality education in Arts, Science & Commerce.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-accent text-accent-foreground shadow-gold">
                  Apply Now
                </Button>
              </Link>
              <a href="https://bubhopal.ac.in/1068/Home" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground">
                  Visit University
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
