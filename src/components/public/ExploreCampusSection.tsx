import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

const videos = [
  {
    id: '1',
    title: 'Campus Tour',
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    id: '2',
    title: 'Student Life',
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    id: '3',
    title: 'Annual Day Celebration',
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    id: '4',
    title: 'NSS Activities',
    youtubeId: 'dQw4w9WgXcQ',
  },
];

export function ExploreCampusSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAutoScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollPos = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    const step = () => {
      scrollPos += 0.8;
      if (scrollPos >= maxScroll) {
        scrollPos = 0;
      }
      container.scrollLeft = scrollPos;
      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isAutoScrolling) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
    return () => stopAutoScroll();
  }, [isAutoScrolling, startAutoScroll, stopAutoScroll]);

  const handlePlay = (videoId: string) => {
    setPlayingVideoId(videoId);
    setIsAutoScrolling(false);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handlePause = () => {
    setPlayingVideoId(null);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  // Duplicate for seamless loop
  const allVideos = [...videos, ...videos];

  return (
    <section className="py-12 md:py-20 bg-secondary/50">
      <div className="container-college mb-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Explore Campus
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take a virtual tour of our campus through videos
          </p>
        </motion.div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allVideos.map((video, index) => (
          <div
            key={`${video.id}-${index}`}
            className="flex-shrink-0 w-[300px] md:w-[400px] rounded-2xl overflow-hidden shadow-lg bg-card border border-border"
          >
            <div className="relative aspect-video">
              {playingVideoId === `${video.id}-${index}` ? (
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handlePlay(`${video.id}-${index}`)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                    aria-label={`Play ${video.title}`}
                  >
                    <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-accent-foreground ml-1" />
                    </div>
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">{video.title}</h3>
              {playingVideoId === `${video.id}-${index}` && (
                <button
                  onClick={handlePause}
                  className="p-2 rounded-full bg-primary/10 text-primary"
                  aria-label="Stop video"
                >
                  <Pause className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
