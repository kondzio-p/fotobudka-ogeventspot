import type { PageData } from "./pageData";

// Przykładowe treści do podglądu lokalnego, gdy brak połączenia z Supabase.
const cities = [
	"Chojnice",
	"Gdańsk",
	"Sopot",
	"Gdynia",
	"Bytów",
	"Kartuzy",
	"Kościerzyna",
	"Słupsk",
	"Lębork",
	"Ustka",
	"Malbork",
	"Tczew",
	"Wejherowo",
	"Puck",
	"Hel",
	"Starogard Gdański",
];

const base: Omit<PageData, "id" | "name" | "slug" | "seo"> = {
	navigation: {
		facebookUrl: "https://www.facebook.com/profile.php?id=61553668165091",
		instagramUrl: "https://www.instagram.com/og.eventspot/",
	},
	videos: [
		{ src: "/assets/main/videos/filmik1s6.webm", alt: "pierwszy taniec" },
		{ src: "/assets/main/videos/filmik2.webm", alt: "szalona ekipa" },
		{ src: "/assets/main/videos/filmik3.webm", alt: "uśmiech!" },
		{ src: "/assets/main/videos/filmik4.webm", alt: "do białego rana" },
	],
	welcomeSection: {
		welcomeText: "Witamy w Fotobudka Chojnice",
		subtitle: "Dopełniamy, by na Twoim wydarzeniu nie zabrakło atrakcji.",
	},
	stats: { clientsCount: "50+", yearsOnMarket: "3 lata", smilesCount: "∞" },
	gallery: {
		images: [
			{ src: "/assets/main/images/mirror.webp", alt: "fotolustro" },
			{ src: "/assets/main/images/360.webp", alt: "fotobudka 360°" },
			{ src: "/assets/main/images/heavysmoke.webp", alt: "ciężki dym" },
			{ src: "/assets/main/images/fountain.webp", alt: "fontanny iskier" },
			{ src: "/assets/main/images/neons.webp", alt: "neony LED" },
		],
	},
	locations: { cities },
	footer: {
		facebookUrl: "https://www.facebook.com/profile.php?id=61553668165091",
		facebookText: "@OG Eventspot",
		instagramUrl: "https://www.instagram.com/og.eventspot/",
		instagramText: "@og.eventspot",
		phoneNumber: "576 934 594",
	},
};

export const demoPages: PageData[] = [
	{
		...base,
		id: "demo-main",
		name: "Strona główna",
		slug: "/",
		seo: {
			title: "Fotobudka Chojnice 360° i fotolustro na wesela | OG Events",
			description:
				"Fotobudka 360°, fotolustro, ciężki dym, fontanny iskier i neony LED na wesela w Chojnicach i na Pomorzu.",
		},
	},
	{
		...base,
		id: "demo-gdansk",
		name: "Gdańsk",
		slug: "/gdansk",
		seo: {
			title: "Fotobudka Gdańsk 360° i fotolustro na wesela | OG Events",
			description: "Fotobudka 360°, fotolustro i ciężki dym na wesela w Gdańsku i Trójmieście.",
		},
		welcomeSection: {
			welcomeText: "Fotobudka na wesele w Gdańsku",
			subtitle: "Przyjeżdżamy z kompletem atrakcji do Gdańska i całego Trójmiasta.",
		},
	},
	{
		...base,
		id: "demo-slupsk",
		name: "Słupsk",
		slug: "/slupsk",
		seo: {
			title: "Fotobudka Słupsk 360° i fotolustro na wesela | OG Events",
			description: "Fotobudka 360°, fotolustro i efekty specjalne na wesela w Słupsku i okolicach.",
		},
		welcomeSection: {
			welcomeText: "Fotobudka na wesele w Słupsku",
			subtitle: "Obsługujemy wesela i imprezy w Słupsku, Ustce i okolicy.",
		},
	},
];
