import { supabase } from './supabase';

// Wszystkie aktywne strony (home i miasta) jednym zapytaniem.
export async function loadPages() {
	const { data, error } = await supabase.from('pages').select('*');
	if (error || !data) return [];
	return data.filter((p) => p.is_active !== false);
}

// Lista miast do stopki i pytań: jedno miasto raz (w bazie są duble jak "walcz" i "wałcz"),
// pierwszeństwo ma wpis z tytułem SEO i adresem bez polskich znaków.
export function cityList(pages) {
	const byName = new Map();
	const score = (p) => (p.meta_title ? 2 : 0) + (/^[a-z0-9-]+$/.test(p.slug) ? 1 : 0);
	for (const p of pages) {
		if (!p.slug || p.slug === 'home' || !p.city_name) continue;
		const prev = byName.get(p.city_name);
		if (!prev || score(p) > score(prev)) byName.set(p.city_name, p);
	}
	const all = [...byName.values()];
	// krótsza nazwa bez tytułu SEO, gdy istnieje pełna ("Sępólno" i "Sępólno Krajeńskie")
	const dup = (p) => !p.meta_title && all.some((o) => o !== p && o.city_name.startsWith(p.city_name + ' '));
	return all
		.filter((p) => !dup(p))
		.map((p) => ({ slug: p.slug, city_name: p.city_name }))
		.sort((a, b) => a.city_name.localeCompare(b.city_name, 'pl'));
}
