import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const desktopImage = {
  url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80',
  title: 'Mahatma Gandhi Mahavidhyala Ashta',
  tagline: 'Empowering Minds, Building Futures Since 1995',
};

const mobileImage = {
  url: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=80',
  title: 'Mahatma Gandhi Mahavidhyala Ashta',
  tagline: 'Empowering Minds, Building Futures Since 1995',
};

export function CollegePhotoSection() {
  const isMobile = useIsMobile();
  const image = isMobile ? mobileImage : desktopImage;

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <motion.div
        className="relative w-full h-full"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <img
          src={image.url}
          alt="Mahatma Gandhi Mahavidhyala Ashta Campus"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg">
            {image.title}
          </h2>
          <p className="text-white/90 text-sm md:text-lg lg:text-xl font-medium drop-shadow-md max-w-2xl">
            {image.tagline}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
