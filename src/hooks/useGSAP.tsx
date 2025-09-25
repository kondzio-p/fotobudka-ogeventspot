import { useEffect, useRef } from "react";

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

		const loadScripts = async () => {
			try {
				await loadScript("/js/gsap.min.js");
				await loadScript("/js/ScrollToPlugin.min.js");
				await loadScript("/js/ScrollTrigger.min.js");
				await loadScript("/js/lenis.min.js");

				await new Promise((resolve) => setTimeout(resolve, 100));

				if (window.gsap && window.ScrollTrigger) {
					window.gsap.registerPlugin(window.ScrollTrigger);
					gsapRef.current = window.gsap;

					if (window.Lenis) {
						const lenis = new window.Lenis({
							duration: 1.2,
							easing: (t: number) =>
								Math.min(1, 1.001 - Math.pow(2, -10 * t)),
							direction: "vertical",
							gestureDirection: "vertical",
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

						lenis.on("scroll", window.ScrollTrigger.update);

						window.gsap.ticker.add((time: number) => {
							lenis.raf(time * 1000);
						});

						window.gsap.ticker.lagSmoothing(0);
					}

					initialized.current = true;
					console.log("GSAP initialized successfully");
				}
			} catch (error) {
				console.warn("Failed to load GSAP libraries:", error);
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
		if (document.querySelector(`script[src="${src}"]`)) {
			resolve();
			return;
		}

		const script = document.createElement("script");
		script.src = src;
		script.async = false;
		script.onload = () => resolve();
		script.onerror = () =>
			reject(new Error(`Failed to load script: ${src}`));
		document.head.appendChild(script);
	});
};
