import { supabase } from "../lib/supabase";

export interface PageData {
	id: string;
	name: string;
	slug: string;
	seo: {
		title: string;
		description: string;
	};
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

// Cache for pages data
let pagesCache: PageData[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Convert database row to PageData
const dbRowToPageData = (row: any): PageData => ({
	id: row.id,
	name: row.name,
	slug: row.slug,
	seo: {
		title: row.seo_title || "Fotobudka Chojnice - OG Events",
		description: row.seo_description || "",
	},
	navigation: row.navigation || { facebookUrl: "", instagramUrl: "" },
	videos: row.videos || [],
	welcomeSection: row.welcome_section || { welcomeText: "", subtitle: "" },
	stats: row.stats || {
		clientsCount: "0",
		yearsOnMarket: "0",
		smilesCount: "0",
	},
	gallery: row.gallery || { images: [] },
	locations: row.locations || { cities: [] },
	footer: row.footer || {
		facebookUrl: "",
		facebookText: "",
		instagramUrl: "",
		instagramText: "",
		phoneNumber: "",
	},
});

// Convert PageData to database format
const pageDataToDbRow = (data: PageData) => ({
	id: data.id,
	name: data.name,
	slug: data.slug,
	is_main: data.slug === "/",
	seo_title: data.seo?.title ?? null,
	seo_description: data.seo?.description ?? null,
	navigation: data.navigation,
	videos: data.videos,
	welcome_section: data.welcomeSection,
	stats: data.stats,
	gallery: data.gallery,
	locations: data.locations,
	footer: data.footer,
});

// Load all pages from database
export const loadAllPages = async (): Promise<PageData[]> => {
	try {
		// Check cache first
		const now = Date.now();
		if (pagesCache.length > 0 && now - cacheTimestamp < CACHE_DURATION) {
			return pagesCache;
		}

		const { data, error } = await supabase
			.from("pages")
			.select("*")
			.order("is_main", { ascending: false })
			.order("created_at", { ascending: true });

		if (error) {
			console.error("Error loading pages:", error);
			return [];
		}

		const pages = data.map(dbRowToPageData);

		// Update cache
		pagesCache = pages;
		cacheTimestamp = now;

		return pages;
	} catch (error) {
		console.error("Error loading pages:", error);
		return [];
	}
};

// Get single page by slug
export const getPageData = async (
	slug: string
): Promise<PageData | undefined> => {
	try {
		const pages = await loadAllPages();
		return pages.find((p) => p.slug === slug);
	} catch (error) {
		console.error("Error getting page data:", error);
		return undefined;
	}
};

// Update page data
export const updatePageData = async (
	id: string,
	data: PageData
): Promise<boolean> => {
	try {
		const dbData = pageDataToDbRow(data);

		const { error } = await supabase
			.from("pages")
			.update(dbData)
			.eq("id", id);

		if (error) {
			console.error("Error updating page:", error);
			return false;
		}

		// Clear cache to force reload
		pagesCache = [];
		cacheTimestamp = 0;

		return true;
	} catch (error) {
		console.error("Error updating page:", error);
		return false;
	}
};

// Add new subpage
export const addNewSubPage = async (
	name: string,
	slug: string
): Promise<PageData | null> => {
	try {
		// Get main page data as template
		const mainPage = await getPageData("/");
		if (!mainPage) {
			throw new Error("Main page not found");
		}

		const newPageData: Omit<PageData, "id"> = {
			name,
			slug: slug.startsWith("/") ? slug : `/${slug}`,
			navigation: { ...mainPage.navigation },
			videos: [...mainPage.videos],
			welcomeSection: { ...mainPage.welcomeSection },
			stats: { ...mainPage.stats },
			gallery: { images: [...mainPage.gallery.images] },
			locations: { cities: [...mainPage.locations.cities] },
			footer: { ...mainPage.footer },
		};

		const { data, error } = await supabase
			.from("pages")
			.insert([
				{
					name: newPageData.name,
					slug: newPageData.slug,
					is_main: false,
					navigation: newPageData.navigation,
					videos: newPageData.videos,
					welcome_section: newPageData.welcomeSection,
					stats: newPageData.stats,
					gallery: newPageData.gallery,
					locations: newPageData.locations,
					footer: newPageData.footer,
				},
			])
			.select()
			.single();

		if (error) {
			console.error("Error adding new page:", error);
			return null;
		}

		// Clear cache to force reload
		pagesCache = [];
		cacheTimestamp = 0;

		return dbRowToPageData(data);
	} catch (error) {
		console.error("Error adding new page:", error);
		return null;
	}
};

// Remove subpage
export const removeSubPage = async (id: string): Promise<boolean> => {
	try {
		const { error } = await supabase
			.from("pages")
			.delete()
			.eq("id", id)
			.neq("is_main", true); // Prevent deleting main page

		if (error) {
			console.error("Error removing page:", error);
			return false;
		}

		// Clear cache to force reload
		pagesCache = [];
		cacheTimestamp = 0;

		return true;
	} catch (error) {
		console.error("Error removing page:", error);
		return false;
	}
};

// Clear cache (useful for admin panel)
export const clearPagesCache = () => {
	pagesCache = [];
	cacheTimestamp = 0;
};

// Get all pages (for compatibility)
export const getAllPages = async (): Promise<PageData[]> => {
	return await loadAllPages();
};
