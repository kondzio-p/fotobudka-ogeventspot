import React from "react";
import type { PageData } from "../../data/pageData";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";
import Hero from "../Sections/Hero";
import { Marquee, OfferSection, StatsSection, StepsSection, GallerySection, FaqCitiesSection } from "../Sections/Sections";
import { useSiteAnimations } from "../../hooks/useSiteAnimations";

interface SitePageProps {
	page: PageData;
	pages: PageData[];
	isMain: boolean;
}

// Strona główna i podstrony miast mają ten sam układ, różnią się tylko treścią z bazy.
const SitePage: React.FC<SitePageProps> = ({ page, pages, isMain }) => {
	useSiteAnimations(page.slug);
	const phone = page.footer.phoneNumber || "576 934 594";
	const cityPages = pages.filter((p) => p.slug !== "/");

	return (
		<>
			<a className="skip-link" href="#oferta">
				Przejdź do oferty
			</a>
			<Header phone={phone} />
			<main>
				<Hero accent={isMain ? "Chojnice i Pomorskie" : page.name} videos={page.videos} phone={phone} />
				<Marquee />
				<OfferSection welcome={page.welcomeSection} phone={phone} />
				<StatsSection stats={page.stats} />
				<StepsSection />
				<GallerySection images={page.gallery.images} />
				<FaqCitiesSection cities={page.locations.cities} pages={pages} cityName={isMain ? undefined : page.name} />
			</main>
			<Footer data={page.footer} cityPages={cityPages} />
		</>
	);
};

export default SitePage;
