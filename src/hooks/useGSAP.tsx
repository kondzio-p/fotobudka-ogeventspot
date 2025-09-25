import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
    Lenis: any;
  }
}

export const useGSAP = () => {
  const gsapRef = useRef<any>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return gsapRef.current;

    // Load GSAP and plugins
    const loadScripts = async () => {
      try {
        // Load scripts in order
        await loadScript('/js/gsap.min.js');
        await loadScript('/js/ScrollToPlugin.min.js');
        await loadScript('/js/ScrollTrigger.min.js');
        await loadScript('/js/lenis.min.js');

        // Wait a bit for scripts to initialize
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize GSAP
        if (window.gsap && window.ScrollTrigger) {
          window.gsap.registerPlugin(window.ScrollTrigger);
          gsapRef.current = window.gsap;
          
          // Initialize Lenis smooth scrolling
          if (window.Lenis) {
            const lenis = new window.Lenis({
              duration: 1.2,
              easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              direction: 'vertical',
              gestureDirection: 'vertical',
              smooth: true,
              mouseMultiplier: 1,
              smoothTouch: false,
              touchMultiplier: 2,
              infinite: false,
            });

            function raf(time: number) {
              lenis.raf(time);
              requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);

            // Connect Lenis with ScrollTrigger
            lenis.on('scroll', window.ScrollTrigger.update);

            window.gsap.ticker.add((time: number) => {
              lenis.raf(time * 1000);
            });

            window.gsap.ticker.lagSmoothing(0);
          }

          initialized.current = true;
          console.log('GSAP initialized successfully');
        }
      } catch (error) {
        console.warn('Failed to load GSAP libraries:', error);
        // Fallback: still mark as initialized so we don't keep trying
        initialized.current = true;
      }
    };

    loadScripts();

    return () => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.killAll();
      }
    };
  }, []);

  return gsapRef.current;
};

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};