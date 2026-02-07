import { motion } from 'framer-motion';

const collegeImages = [
  {
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
    title: 'Mahatma Gandhi Mahavidhyala Ashta',
    tagline: 'Empowering Minds, Building Futures Since 1995',
  },
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80',
    title: 'Mahatma Gandhi Mahavidhyala Ashta',
    tagline: 'Affiliated to Barkatullah University, Bhopal',
  },
  {
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80',
    title: 'Mahatma Gandhi Mahavidhyala Ashta',
    tagline: 'Excellence in Arts, Science & Commerce Education',
  },
];

export function CollegePhotoSection() {
  return (
    <section className="relative w-full overflow-hidden">
      <motion.div
        className="relative w-full aspect-[16/7] md:aspect-[16/6]"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <img
          src={collegeImages[0].url}
          alt="Mahatma Gandhi Mahavidhyala Ashta Campus"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-end pb-8 md:pb-12 px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg">
            {collegeImages[0].title}
          </h2>
          <p className="text-white/90 text-sm md:text-lg lg:text-xl font-medium drop-shadow-md max-w-2xl">
            {collegeImages[0].tagline}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
