import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

interface ReadingProgressResult {
  progress: number;
  hasReachedEnd: boolean;
  endRef: RefObject<HTMLDivElement | null>;
  reset: () => void;
}

/**
 * Tracks reading progress inside the induction scroll container.
 * The "I've read this chapter" action stays disabled until the reader has
 * scrolled through the content (or the content fits on one screen).
 */
export function useReadingProgress(contentKey: string | number): ReadingProgressResult {
  const [progress, setProgress] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setProgress(0);
    setHasReachedEnd(false);
  }, []);

  useEffect(() => {
    reset();
    const container = document.getElementById('induction-scroll');
    if (!container) return;

    container.scrollTo({ top: 0, behavior: 'auto' });

    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const scrollable = container.scrollHeight - container.clientHeight;
        const nextProgress =
          scrollable <= 8
            ? 100
            : Math.min(100, Math.max(0, (container.scrollTop / scrollable) * 100));
        setProgress(Math.round(nextProgress));
        if (nextProgress >= 92) setHasReachedEnd(true);
      });
    };

    update();
    container.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setHasReachedEnd(true);
      },
      { root: container, threshold: 0.4 },
    );
    if (endRef.current) observer.observe(endRef.current);

    return () => {
      window.cancelAnimationFrame(frame);
      container.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, [contentKey, reset]);

  return { progress, hasReachedEnd, endRef, reset };
}
