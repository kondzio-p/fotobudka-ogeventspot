import React from "react";
import PhotoGallery from "../Sections/PhotoGallery";
import WelcomeSection from "../Sections/WelcomeSection";
import StatsSection from "../Sections/StatsSection";
import ImageGallerySection from "../Sections/ImageGallerySection";
import LocationsSection from "../Sections/LocationsSection";
import type { PageData } from "../../data/pageData";

interface MainPageProps {
	data?: PageData;
}

const MainPage: React.FC<MainPageProps> = ({ data }) => {
	return (
		<>
			<PhotoGallery videos={data?.videos} />
			<WelcomeSection
				data={{
					welcomeText: data?.welcomeSection.welcomeText,
					subtitle: data?.welcomeSection.subtitle,
				}}
			/>
			<StatsSection data={data?.stats} />
			<ImageGallerySection data={{ images: data?.gallery.images }} />
			<LocationsSection data={{ cities: data?.locations.cities }} />
		</>
	);
};

export default MainPage;
