import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

// Animacje strony. Ta sama logika co js/main.js w fotobudka-chojnice.
export function useSiteAnimations(key: string) {
	useEffect(() => {
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		document.documentElement.classList.add("js");
		const cleanups: Array<() => void> = [];

		const header = document.querySelector(".site-header");
		const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 40);
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		cleanups.push(() => window.removeEventListener("scroll", onScroll));

		const navLinks = [...document.querySelectorAll<HTMLAnchorElement>(".nav-links a[href*='#']")];
		const sections = navLinks
			.map((a) => document.getElementById(a.hash.slice(1)))
			.filter((s): s is HTMLElement => Boolean(s));
		const io = new IntersectionObserver(
			(entries) =>
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					navLinks.forEach((a) => a.classList.toggle("is-active", a.hash === "#" + entry.target.id));
				}),
			{ rootMargin: "-45% 0px -50% 0px" }
		);
		sections.forEach((s) => io.observe(s));
		cleanups.push(() => io.disconnect());

		const runCounter = (el: HTMLElement) => {
			const target = Number(el.dataset.count);
			const suffix = el.dataset.suffix || "";
			if (reduceMotion) {
				el.textContent = target + suffix;
				return;
			}
			const obj = { v: 0 };
			gsap.to(obj, {
				v: target,
				duration: 1.8,
				ease: "power3.out",
				onUpdate: () => {
					el.textContent = Math.round(obj.v) + suffix;
				},
			});
		};

		const ctx = gsap.context(() => {
			if (reduceMotion) {
				document.querySelectorAll(".reveal").forEach((el) => el.classList.remove("reveal"));
				document.querySelectorAll<HTMLElement>(".stat-num[data-count]").forEach(runCounter);
				return;
			}

			const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
			intro.from(".nav-pill", { y: -30, opacity: 0, duration: 0.9 });
			const title = document.querySelector(".hero-title");
			if (title) {
				const split = new SplitText(title, { type: "lines,words", linesClass: "split-line" });
				intro.from(split.words, { yPercent: 110, opacity: 0, rotate: 3, duration: 1, stagger: 0.045 }, "-=0.5");
				intro
					.from(".hero-eyebrow", { opacity: 0, x: -20, duration: 0.8 }, "<")
					.from(".hero-lead, .hero-actions", { opacity: 0, y: 20, duration: 0.8, stagger: 0.12 }, "-=0.6")
					.from(
						".hero .polaroid",
						{
							opacity: 0,
							y: 80,
							rotate: (i: number) => (i % 2 ? 18 : -18),
							scale: 0.85,
							duration: 1.1,
							stagger: 0.12,
							ease: "back.out(1.4)",
						},
						"-=1"
					);

				gsap.utils.toArray<HTMLElement>(".hero .polaroid").forEach((p, i) => {
					gsap.to(p, {
						yPercent: i % 2 ? -10 : -22,
						ease: "none",
						scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
					});
				});

				gsap.to(".blob-1", { x: -40, y: 30, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
				gsap.to(".blob-2", { x: 50, y: -30, duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut" });
				gsap.to(".blob-3", { scale: 1.25, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
			}

			const sparkleBox = document.querySelector(".sparkles");
			if (sparkleBox) {
				cleanups.push(() => sparkleBox.replaceChildren());
				for (let i = 0; i < 18; i++) {
					const s = document.createElement("span");
					s.className = "sparkle";
					s.textContent = i % 3 ? "✦" : "♡";
					s.style.left = gsap.utils.random(2, 98) + "%";
					s.style.top = gsap.utils.random(10, 95) + "%";
					s.style.fontSize = gsap.utils.random(8, 18) + "px";
					if (i % 3 === 0) s.style.color = "#d897a9";
					sparkleBox.appendChild(s);
					gsap.to(s, {
						opacity: gsap.utils.random(0.35, 0.8),
						y: gsap.utils.random(-60, -140),
						rotate: gsap.utils.random(-40, 40),
						duration: gsap.utils.random(4, 8),
						delay: gsap.utils.random(0, 5),
						repeat: -1,
						yoyo: true,
						ease: "sine.inOut",
					});
				}
			}

			const track = document.querySelector<HTMLElement>(".marquee-track");
			if (track) {
				const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
				ScrollTrigger.create({
					onUpdate: (self) =>
						gsap.to(loop, { timeScale: self.direction === 1 ? 1 : -1, duration: 0.4, overwrite: true }),
				});
			}

			gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
				gsap.to(el, {
					opacity: 1,
					y: 0,
					duration: 1,
					ease: "power3.out",
					scrollTrigger: { trigger: el, start: "top 85%" },
				});
			});

			gsap.utils.toArray<HTMLElement>(".section-title, .footer-title").forEach((h) => {
				const split = new SplitText(h, { type: "words" });
				gsap.from(split.words, {
					yPercent: 60,
					opacity: 0,
					duration: 0.9,
					stagger: 0.06,
					ease: "power3.out",
					scrollTrigger: { trigger: h, start: "top 85%" },
				});
			});

			if (document.querySelector(".offer-grid")) {
				gsap.from(".offer-card", {
					opacity: 0,
					y: 60,
					rotate: (i: number) => (i % 2 ? 2 : -2),
					duration: 1,
					stagger: 0.1,
					ease: "power3.out",
					scrollTrigger: { trigger: ".offer-grid", start: "top 80%" },
				});
			}

			if (document.querySelector(".steps-list")) {
				gsap.from(".step-num", {
					scale: 0.4,
					opacity: 0,
					duration: 0.8,
					stagger: 0.15,
					ease: "back.out(2)",
					scrollTrigger: { trigger: ".steps-list", start: "top 80%" },
				});
			}

			document.querySelectorAll<HTMLElement>(".stat-num[data-count]").forEach((el) => {
				ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => runCounter(el) });
			});

			if (document.querySelector(".footer-phone")) {
				gsap.from(".footer-phone", {
					scale: 0.8,
					opacity: 0,
					duration: 1,
					ease: "back.out(1.6)",
					scrollTrigger: { trigger: ".footer-phone", start: "top 90%" },
				});
			}
		});

		// odpowiedzi FAQ rozwijają się płynnie
		document.querySelectorAll<HTMLDetailsElement>(".faq-item details").forEach((d) => {
			const summary = d.querySelector("summary");
			const body = summary?.nextElementSibling as HTMLElement | null;
			if (!summary || !body || reduceMotion) return;
			const onClick = (e: Event) => {
				e.preventDefault();
				if (d.open) {
					gsap.to(body, { height: 0, opacity: 0, duration: 0.35, ease: "power2.in", onComplete: () => {
						d.open = false;
					} });
				} else {
					d.open = true;
					gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.5, ease: "power3.out" });
				}
			};
			summary.addEventListener("click", onClick);
			cleanups.push(() => summary.removeEventListener("click", onClick));
		});

		const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);

		return () => {
			window.clearTimeout(refresh);
			cleanups.forEach((fn) => fn());
			ctx.revert();
		};
	}, [key]);
}
