export interface PageData {
	id: string;
	name: string;
	slug: string; // '/' lub '/miasto'
	navigation: {
		facebookUrl: string;
		instagramUrl: string;
	};
	videos: Array<{ src: string; alt: string; startTime?: number }>;
	welcomeSection: {
		welcomeText: string;
		subtitle: string;
	};
	stats: {
		clientsCount: string;
		yearsOnMarket: string;
		smilesCount: string;
	};
	gallery: {
		images: Array<{ src: string; alt: string }>;
	};
	locations: {
		cities: string[];
	};
	footer: {
		facebookUrl: string;
		facebookText: string;
		instagramUrl: string;
		instagramText: string;
		phoneNumber: string;
	};
}

// --- STORAGE helpers ---
const STORAGE_KEY = "ogevents_pages";

const loadPages = (): PageData[] => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch {}
	return defaultPages();
};

const savePages = (pages: PageData[]) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
	} catch {}
};

// --- DEFAULT DATA ---
const defaultPages = (): PageData[] => [
	{
		id: "main",
		name: "Strona główna",
		slug: "/",
		navigation: {
			facebookUrl:
				"https://www.facebook.com/profile.php?id=61553668165091",
			instagramUrl: "https://www.instagram.com/og.eventspot/",
		},
		videos: [
			{
				src: "/assets/main/videos/film1.webm",
				alt: "Event video 1",
				startTime: 7,
			},
			{
				src: "/assets/main/videos/film2.webm",
				alt: "Event video 2",
				startTime: 3,
			},
			{
				src: "/assets/main/videos/film1.webm",
				alt: "Event video 3",
				startTime: 2,
			},
			{
				src: "/assets/main/videos/film2.webm",
				alt: "Event video 4",
				startTime: 4,
			},
		],
		welcomeSection: {
			welcomeText: "Fotobudka OG Event Spot!",
			subtitle:
				"Dopełniamy, by na Twoim wydarzeniu nie zabrakło Atrakcji!",
		},
		stats: {
			clientsCount: "200+",
			yearsOnMarket: "5 lat",
			smilesCount: "∞",
		},
		gallery: {
			images: [
				{ src: "/assets/main/images/360.png", alt: "Gallery image 1" },
				{
					src: "/assets/main/images/mirror.jpg",
					alt: "Gallery image 2",
				},
				{
					src: "/assets/main/images/heavysmoke.jpg",
					alt: "Gallery image 3",
				},
				{
					src: "/assets/main/images/fountain.jpg",
					alt: "Gallery image 4",
				},
				{
					src: "/assets/main/images/neons.jpg",
					alt: "Gallery image 5",
				},
			],
		},
		locations: {
			cities: [
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
			],
		},
		footer: {
			facebookUrl:
				"https://www.facebook.com/profile.php?id=61553668165091",
			facebookText: "@OG Eventspot",
			instagramUrl: "https://www.instagram.com/og.eventspot/",
			instagramText: "@og.eventspot",
			phoneNumber: "576 934 594",
		},
	},
];

export let allPages: PageData[] = loadPages();

export const getPageData = (slug: string): PageData | undefined => {
	return allPages.find((p) => p.slug === slug);
};

export const updatePageData = (id: string, data: PageData) => {
	const index = allPages.findIndex((p) => p.id === id);
	if (index >= 0) {
		allPages[index] = { ...data };
		savePages(allPages);
	}
};

export const addNewSubPage = (name: string, slug: string): PageData => {
	const id = `${Date.now().toString(36)}`;
	const base = getPageData("/")!;
	const newPage: PageData = {
		id,
		name,
		slug: slug.startsWith("/") ? slug : `/${slug}`,
		navigation: { ...base.navigation },
		videos: [...base.videos],
		welcomeSection: { ...base.welcomeSection },
		stats: { ...base.stats }, // takie same wszędzie
		gallery: { images: [...base.gallery.images] },
		locations: { cities: [...base.locations.cities] },
		footer: { ...base.footer },
	};
	allPages.push(newPage);
	savePages(allPages);
	return newPage;
};

// NOWE: usuwanie podstron
export const removeSubPage = (id: string) => {
	const idx = allPages.findIndex((p) => p.id === id && p.slug !== "/");
	if (idx >= 0) {
		allPages.splice(idx, 1);
		savePages(allPages);
	}
};
