import { useEffect, useState, useRef } from 'react';
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

function AnimatedCounter({ value, isVisible }: { value: string; isVisible: boolean }) {
  const numericMatch = value.match(/^(\d+)/);
  const suffix = value.replace(/^\d+/, '');
  const target = numericMatch ? parseInt(numericMatch[1], 10) : 0;
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current || !numericMatch) return;
    hasAnimated.current = true;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isVisible, target, numericMatch]);

  if (!numericMatch) return <span>{value}</span>;
  return <span>{count}{suffix}</span>;
}

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon || 'award'] || Award;
            return (
              <motion.div
                key={stat.id}
                className="text-center group p-4 md:p-6 rounded-2xl bg-card shadow-sm border border-border/50"
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 text-primary mb-3 md:mb-4">
                  <Icon className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
                  <AnimatedCounter value={stat.value} isVisible={isVisible} />
                </h3>
                <p className="text-muted-foreground font-medium text-sm md:text-base">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
