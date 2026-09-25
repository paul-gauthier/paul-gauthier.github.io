(() => {
  const videos = document.querySelectorAll('video[data-autoplay-in-view]');
  if (!videos.length || !('IntersectionObserver' in window)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        video.play().catch(() => {
          // Keep the native play control available if autoplay is blocked.
        });
      } else {
        video.pause();
      }
    }
  }, { threshold: 0.5 });

  for (const video of videos) observer.observe(video);
})();
