import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Navigation, Keyboard, Autoplay } from "swiper/modules";
import "swiper/css/effect-cards";
import type { PageData } from "../../data/pageData";
import { offers } from "../../data/offers";
import { slugify } from "../../lib/slugify";
import { telHref } from "../Layout/Header";

const marqueeWords = ["Wesela", "Urodziny", "Imprezy firmowe", "Osiemnastki", "Studniówki", "Komunie"];

export const Marquee: React.FC = () => (
	<div className="marquee" aria-hidden="true">
		<div className="marquee-track">
			{[0, 1].map((copy) =>
				marqueeWords.map((w) => (
					<React.Fragment key={copy + w}>
						<span>{w}</span>
						<i>✦</i>
					</React.Fragment>
				))
			)}
		</div>
	</div>
);

export const OfferSection: React.FC<{ welcome: PageData["welcomeSection"]; phone: string }> = ({ welcome, phone }) => (
	<section id="oferta" className="section offer" aria-labelledby="offer-title">
		<header className="section-head reveal">
			<p className="script section-kicker">{welcome.welcomeText || "Witamy w OG Events"}</p>
			<h2 id="offer-title" className="section-title">
				Nasza <em>oferta</em>
			</h2>
			{welcome.subtitle && <p className="section-lead">{welcome.subtitle}</p>}
		</header>
		<div className="offer-grid">
			{offers.map((o) => (
				<a key={o.title} className="offer-card" href={telHref(phone)} aria-label={`${o.title}: zapytaj o termin`}>
					<div className="offer-photo">
						<img src={o.image} width={o.width} height={o.height} alt={o.alt} loading="lazy" decoding="async" />
					</div>
					<div className="offer-body">
						<h3>{o.title}</h3>
						<p>{o.text}</p>
						<span className="offer-more">
							Zapytaj o termin <span aria-hidden="true">→</span>
						</span>
					</div>
				</a>
			))}
		</div>
	</section>
);

// "50+" -> 50 i "+", "3 lata" -> 3 i " lata", "∞" -> bez licznika
const parseStat = (value: string) => {
	const m = value.trim().match(/^(\d+)(.*)$/);
	return m ? { count: m[1], suffix: m[2] } : null;
};

export const StatsSection: React.FC<{ stats: PageData["stats"] }> = ({ stats }) => {
	const items = [
		{ value: stats.clientsCount, label: "zadowolonych klientów" },
		{ value: stats.yearsOnMarket, label: "na rynku" },
		{ value: stats.smilesCount, label: "uśmiechów" },
	];
	return (
		<section className="section stats" aria-label="My w liczbach">
			<div className="stats-inner">
				{items.map((item) => {
					const parsed = parseStat(item.value);
					return (
						<div key={item.label} className="stat reveal">
							<span
								className="stat-num"
								data-count={parsed?.count}
								data-suffix={parsed?.suffix}
							>
								{item.value}
							</span>
							<span className="stat-label">{item.label}</span>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export const StepsSection: React.FC = () => (
	<section className="section steps" aria-labelledby="steps-title">
		<header className="section-head reveal">
			<p className="script section-kicker">prosto i bez stresu</p>
			<h2 id="steps-title" className="section-title">
				Jak <em>zarezerwować</em>
			</h2>
		</header>
		<ol className="steps-list">
			{[
				["Zadzwoń lub napisz", "Podaj datę i miejsce imprezy, a od razu sprawdzimy, czy termin jest wolny."],
				["Wybierz atrakcje", "Dobierz fotobudkę, fotolustro i efekty specjalne. Przy kilku atrakcjach przygotujemy korzystniejszą cenę."],
				["Bawcie się", "Przywozimy, montujemy i obsługujemy wszystko na miejscu. Do Was należy tylko obowiązek dobrej zabawy."],
			].map(([title, text], i) => (
				<li key={title} className="step reveal">
					<span className="step-num">0{i + 1}</span>
					<h3>{title}</h3>
					<p>{text}</p>
				</li>
			))}
		</ol>
	</section>
);

export const GallerySection: React.FC<{ images: PageData["gallery"]["images"] }> = ({ images }) => {
	const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (!images.length) return null;
	return (
		<section id="galeria" className="section gallery" aria-labelledby="gallery-title">
			<header className="section-head reveal">
				<p className="script section-kicker">chwile, które zostają</p>
				<h2 id="gallery-title" className="section-title">
					Nasza <em>galeria</em>
				</h2>
			</header>
			<Swiper
				className="gallery-swiper"
				modules={[EffectCards, Navigation, Keyboard, Autoplay]}
				effect="cards"
				grabCursor
				loop={images.length > 2}
				cardsEffect={{ perSlideOffset: 10, perSlideRotate: 4, slideShadows: false }}
				navigation={{ nextEl: ".gallery-next", prevEl: ".gallery-prev" }}
				keyboard={{ enabled: true }}
				autoplay={reduceMotion ? false : { delay: 3800, disableOnInteraction: true }}
			>
				{images.map((img, i) => (
					<SwiperSlide key={img.src + i} tag="figure">
						<img src={img.src} alt={img.alt} loading="lazy" />
						<figcaption className="script">{img.alt}</figcaption>
					</SwiperSlide>
				))}
			</Swiper>
			<div className="gallery-nav">
				<button className="gallery-prev" type="button" aria-label="Poprzednie zdjęcie">
					←
				</button>
				<button className="gallery-next" type="button" aria-label="Następne zdjęcie">
					→
				</button>
			</div>
		</section>
	);
};

interface FaqCitiesProps {
	cities: string[];
	pages: PageData[];
	cityName?: string;
}

export const FaqCitiesSection: React.FC<FaqCitiesProps> = ({ cities, pages, cityName }) => {
	const faq = [
		{
			q: cityName ? "Ile kosztuje wynajem fotobudki 360°?" : "Ile kosztuje wynajem fotobudki 360° w Chojnicach?",
			a: "Cenę ustalamy indywidualnie w zależności od czasu wynajmu i dodatkowych usług. Skontaktuj się z nami, aby uzyskać wycenę.",
		},
		{
			q: cityName ? `Czy obsługujecie wesela w mieście ${cityName} i okolicach?` : "Czy dojeżdżacie poza Chojnice? (Gdańsk, Słupsk, itp.)",
			a: "Tak! Obsługujemy miasta poza Chojnicami, na terenie całego Pomorza.",
		},
		{
			q: "Czy wydruki zdjęć z fotolustra są w cenie?",
			a: "Tak, wydruki są nielimitowane przez cały czas trwania usługi. Goście drukują tyle, ile chcą.",
		},
		{
			q: "Czy można połączyć kilka atrakcji?",
			a: "Tak. Przy pakiecie, na przykład fotolustro z fotobudką 360° albo ciężkim dymem, cena jest niższa niż suma pojedynczych usług.",
		},
	];
	const pageFor = (city: string) =>
		pages.find((p) => p.slug !== "/" && (p.slug === "/" + slugify(city) || p.name === city));

	return (
		<section id="faq" className="section faq-area" aria-labelledby="faq-title">
			<div className="faq-col" itemScope itemType="https://schema.org/FAQPage">
				<header className="section-head section-head-left reveal">
					<p className="script section-kicker">dobrze wiedzieć</p>
					<h2 id="faq-title" className="section-title">
						Najczęściej zadawane <em>pytania</em>
					</h2>
				</header>
				{faq.map((item) => (
					<div key={item.q} className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
						<details>
							<summary itemProp="name">{item.q}</summary>
							<div className="faq-answer" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
								<p itemProp="text">{item.a}</p>
							</div>
						</details>
					</div>
				))}
			</div>

			<aside className="cities reveal" aria-labelledby="cities-title">
				<h3 id="cities-title">Gdzie działamy?</h3>
				<p>Chojnice i całe Pomorze, między innymi:</p>
				<ul className="city-chips">
					{cities.map((city) => {
						const page = pageFor(city);
						return (
							<li key={city}>
								{page ? <Link to={page.slug}>{city}</Link> : city}
							</li>
						);
					})}
				</ul>
			</aside>
		</section>
	);
};
