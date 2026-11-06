import React, { useRef, useState } from "react";
import type { PageData } from "../../data/pageData";
import { telHref } from "../Layout/Header";

interface HeroProps {
	accent: string;
	videos: PageData["videos"];
	phone: string;
}

const tilts = [-7, 5, -3, 8];
const fallbackCaptions = ["pierwszy taniec", "szalona ekipa", "uśmiech!", "do białego rana"];

// poster_filmikN.webp istnieje dla filmów filmikN; dla innych filmów przeglądarka pokaże pierwszą klatkę
const posterFor = (src: string) => {
	const n = src.match(/filmik(\d)/)?.[1];
	return n ? `/assets/main/videos/poster_filmik${n}.webp` : undefined;
};

const Hero: React.FC<HeroProps> = ({ accent, videos, phone }) => {
	const refs = useRef<Array<HTMLVideoElement | null>>([]);
	const [playing, setPlaying] = useState<number | null>(null);

	const toggle = (i: number) => {
		const video = refs.current[i];
		if (!video) return;
		if (playing === i) {
			video.pause();
			setPlaying(null);
			return;
		}
		refs.current.forEach((v, j) => j !== i && v?.pause());
		video.play().catch(() => {});
		setPlaying(i);
	};

	return (
		<section className="hero" aria-labelledby="hero-title">
			<div className="hero-bg" aria-hidden="true">
				<span className="blob blob-1" />
				<span className="blob blob-2" />
				<span className="blob blob-3" />
			</div>
			<div className="sparkles" aria-hidden="true" />

			<div className="hero-inner">
				<div className="hero-copy">
					<p className="script hero-eyebrow">OG Events</p>
					<h1 id="hero-title" className="hero-title">
						Fotobudka 360° i fotolustro na wesela <em>{accent}</em>
					</h1>
					<p className="hero-lead">
						Fotobudka obrotowa 360°, fotolustro, ciężki dym, fontanny iskier i neony LED na wesela, imprezy
						firmowe i urodziny.
					</p>
					<div className="hero-actions">
						<a className="btn btn-primary" href={telHref(phone)}>
							Sprawdź wolny termin
						</a>
						<a className="btn btn-ghost" href="#oferta">
							Zobacz atrakcje
						</a>
					</div>
				</div>

				<div className="hero-polaroids">
					{videos.slice(0, 4).map((video, i) => (
						<figure
							key={video.src + i}
							className={"polaroid polaroid-video" + (playing === i ? " is-playing" : "")}
							style={{ "--tilt": tilts[i] + "deg" } as React.CSSProperties}
						>
							<span className="tape" aria-hidden="true" />
							<div className="video-wrap">
								<video
									ref={(el) => (refs.current[i] = el)}
									src={video.src}
									poster={posterFor(video.src)}
									muted
									loop
									playsInline
									preload={posterFor(video.src) ? "none" : "metadata"}
									aria-label={video.alt || "Film z wesela"}
									onClick={() => toggle(i)}
								/>
								<button
									className="play-btn"
									type="button"
									aria-label={playing === i ? "Zatrzymaj film" : "Odtwórz film"}
									onClick={() => toggle(i)}
								>
									<span />
								</button>
							</div>
							<figcaption className="script">{video.alt || fallbackCaptions[i]}</figcaption>
						</figure>
					))}
				</div>
			</div>
		</section>
	);
};

export default Hero;
