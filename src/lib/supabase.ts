import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Bez danych Supabase strona działa w trybie demo: treści z src/data/demoPages.ts,
// panel bez logowania, zmiany trzymane tylko w pamięci przeglądarki.
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

export const supabase = createClient(
	supabaseUrl || "http://localhost:54321",
	supabaseAnonKey || "demo-anon-key"
);

export type Database = {
	public: {
		Tables: {
			pages: {
				Row: {
					id: string;
					name: string;
					slug: string;
					is_main: boolean;
					navigation: any;
					videos: any;
					welcome_section: any;
					stats: any;
					gallery: any;
					locations: any;
					footer: any;
					created_at: string;
					updated_at: string;
					seo_title: string | null;
					seo_description: string | null;
				};
				Insert: {
					id?: string;
					name: string;
					slug: string;
					is_main?: boolean;
					navigation?: any;
					videos?: any;
					welcome_section?: any;
					stats?: any;
					gallery?: any;
					locations?: any;
					footer?: any;
					created_at?: string;
					updated_at?: string;
					seo_title: string | null;
					seo_description: string | null;
				};
				Update: {
					id?: string;
					name?: string;
					slug?: string;
					is_main?: boolean;
					navigation?: any;
					videos?: any;
					welcome_section?: any;
					stats?: any;
					gallery?: any;
					locations?: any;
					footer?: any;
					created_at?: string;
					updated_at?: string;
					seo_title: string | null;
					seo_description: string | null;
				};
			};
		};
	};
};
