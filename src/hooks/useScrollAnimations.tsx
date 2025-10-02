import { useEffect, useRef } from "react";

interface AnimationConfig {
	threshold?: number;
	rootMargin?: string;
}

export const useScrollAnimations = (config: AnimationConfig = {}) => {
	const { threshold = 0.1, rootMargin = "0px 0px -50px 0px" } = config;
	const observerRef = useRef<IntersectionObserver | null>(null);
	const animatedElements = useRef<Set<Element>>(new Set());
	const isInitialized = useRef(false);
	const gsapRef = useRef<any>(null);

	useEffect(() => {
		// Prevent multiple initializations
		if (isInitialized.current) return;
		isInitialized.current = true;

		// Get GSAP reference
		gsapRef.current = (window as any).gsap;

		const checkInitialVisibility = () => {
			const elementsToCheck = document.querySelectorAll(`
        .welcome-header,
        .offer-card,
        .stat-card,
        .image-slide,
        .contact-item,
        h3
      `);

			elementsToCheck.forEach((element) => {
				const rect = element.getBoundingClientRect();
				const isVisible =
					rect.top < window.innerHeight && rect.bottom > 0;

				if (isVisible) {
					animateElement(element);
				}
			});
		};

		const animateCounter = (element: HTMLElement) => {
			if (element.dataset.counterAnimated === "true") return;
			element.dataset.counterAnimated = "true";

			const finalText =
				element.getAttribute("data-final-value") ||
				element.textContent ||
				"";

			if (finalText.trim() === "∞") {
				return;
			}

			const hasPlus = /\+$/.test(finalText);
			const hasLat = /lat$/.test(finalText);
			const num = parseInt(finalText.replace(/[^\d]/g, ""), 10) || 0;
			const suffix = hasLat ? " lat" : hasPlus ? "+" : "";

			if (num > 0) {
				let current = 0;
				const increment = num / 60; // 60 frames for smooth animation
				const duration = 2000;
				const frameTime = duration / 60;

				const timer = setInterval(() => {
					current += increment;
					if (current >= num) {
						current = num;
						clearInterval(timer);
					}
					element.textContent =
						Math.round(current).toString() + suffix;
				}, frameTime);
			}
		};

		const animateHeading = (element: Element) => {
			if (animatedElements.current.has(element)) return;
			animatedElements.current.add(element);

			const h3 = element as HTMLElement;

			if (gsapRef.current) {
				gsapRef.current.to(h3, {
					opacity: 1,
					y: 0,
					duration: 0.8,
					ease: "back.out(1.7)",
					onComplete: () => {
						h3.classList.add("animated");
					},
				});
			} else {
				h3.classList.add("animated");
			}
		};

		const animateElement = (element: Element) => {
			if (animatedElements.current.has(element)) return;

			const classList = element.classList;
			const tagName = element.tagName.toLowerCase();

			if (tagName === "h3") {
				animateHeading(element);
				return;
			}

			animatedElements.current.add(element);

			if (classList.contains("welcome-header")) {
				const h2 = element.querySelector("h2") as HTMLElement;
				const p = element.querySelector("p") as HTMLElement;

				if (h2 && h2.style.opacity !== "1") {
					h2.style.opacity = "1";
					h2.style.transform = "translateY(0)";
					h2.style.transition =
						"all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
				}

				if (p && p.style.opacity !== "1") {
					setTimeout(() => {
						p.style.opacity = "1";
						p.style.transform = "translateY(0)";
						p.style.transition =
							"all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s";
					}, 200);
				}
			}

			if (classList.contains("offer-card")) {
				if ((element as HTMLElement).style.opacity === "1") return;
				(element as HTMLElement).style.opacity = "1";
				(element as HTMLElement).style.transform =
					"translateY(0) rotateX(0deg)";
				(element as HTMLElement).style.transition =
					"all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
			}

			if (classList.contains("stat-card")) {
				if ((element as HTMLElement).style.opacity === "1") return;
				(element as HTMLElement).style.opacity = "1";
				(element as HTMLElement).style.transform =
					"translateY(0) scale(1)";
				(element as HTMLElement).style.transition =
					"all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

				const counterElement = element.querySelector(
					".stat-number"
				) as HTMLElement;
				if (
					counterElement &&
					counterElement.dataset.counterAnimated !== "true"
				) {
					setTimeout(() => animateCounter(counterElement), 500);
				}
			}

			if (classList.contains("image-slide")) {
				if ((element as HTMLElement).style.opacity === "1") return;
				(element as HTMLElement).style.opacity = "1";
				(element as HTMLElement).style.transform = "scale(1)";
				(element as HTMLElement).style.transition =
					"all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
			}

			if (classList.contains("contact-item")) {
				if ((element as HTMLElement).style.opacity === "1") return;
				(element as HTMLElement).style.opacity = "1";
				(element as HTMLElement).style.transform = "translateX(0)";
				(element as HTMLElement).style.transition =
					"all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
			}
		};

		let scrollTimeout: NodeJS.Timeout;
		const debouncedScroll = () => {
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(checkInitialVisibility, 100);
		};

		observerRef.current = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						animateElement(entry.target);
					}
				});
			},
			{
				threshold,
				rootMargin,
			}
		);

		const elementsToObserve = document.querySelectorAll(`
      .welcome-header,
      .offer-card,
      .stat-card,
      .image-slide,
      .contact-item,
      h3
    `);

		elementsToObserve.forEach((element) => {
			observerRef.current?.observe(element);
		});

		window.addEventListener("scroll", debouncedScroll, { passive: true });

		const initialCheckTimer = setTimeout(checkInitialVisibility, 300);

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
			window.removeEventListener("scroll", debouncedScroll);
			animatedElements.current.clear();
			clearTimeout(scrollTimeout);
			clearTimeout(initialCheckTimer);
			isInitialized.current = false;
		};
	}, [threshold, rootMargin]);

	return observerRef.current;
};
