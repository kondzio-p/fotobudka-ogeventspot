import React, { useState } from "react";

interface LocationsSectionProps {
	data?: {
		cities?: string[];
	};
}

const LocationsSection: React.FC<LocationsSectionProps> = ({ data }) => {
	const [isOverlayOpen, setIsOverlayOpen] = useState(false);

	const defaultCities = [
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

	const cities = data?.cities || defaultCities;
	const midPoint = Math.ceil(cities.length / 2);
	const firstColumn = cities.slice(0, midPoint);
	const secondColumn = cities.slice(midPoint);

	const showOverlay = () => {
		setIsOverlayOpen(true);
		document.body.style.overflow = "hidden";
	};

	const hideOverlay = () => {
		setIsOverlayOpen(false);
		document.body.style.overflow = "";
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			hideOverlay();
		}
	};

	const slugify = (str: string) =>
		str
			.toLowerCase()
			.replace(/ą/g, "a")
			.replace(/ć/g, "c")
			.replace(/ę/g, "e")
			.replace(/ł/g, "l")
			.replace(/ń/g, "n")
			.replace(/ó/g, "o")
			.replace(/ś/g, "s")
			.replace(/ż/g, "z")
			.replace(/ź/g, "z")
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "") // usuwanie reszty diakrytyków
			.replace(/[^a-z0-9\s-]/g, "")
			.trim()
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");

	React.useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				hideOverlay();
			}
		};

		if (isOverlayOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOverlayOpen]);

	return (
		<>
			<section
				className="locations-section py-5"
				style={{ background: "rgba(255, 255, 255, 0.9)" }}
			>
				<div className="container text-center">
					<button
						className="locations-trigger-btn"
						onClick={showOverlay}
						style={{
							background: "#801039",
							color: "white",
							border: "none",
							padding: "15px 40px",
							borderRadius: "25px",
							fontSize: "18px",
							fontWeight: 500,
							cursor: "pointer",
							transition: "all 0.3s ease",
							boxShadow: "0 5px 15px rgba(128, 16, 57, 0.3)",
						}}
						onMouseOver={(e) => {
							e.currentTarget.style.background = "#a01447";
							e.currentTarget.style.transform =
								"translateY(-2px)";
							e.currentTarget.style.boxShadow =
								"0 8px 20px rgba(128, 16, 57, 0.4)";
						}}
						onMouseOut={(e) => {
							e.currentTarget.style.background = "#801039";
							e.currentTarget.style.transform = "translateY(0)";
							e.currentTarget.style.boxShadow =
								"0 5px 15px rgba(128, 16, 57, 0.3)";
						}}
					>
						Gdzie działamy?
					</button>
				</div>
			</section>

			{/* Overlay */}
			<div
				className={`locations-overlay ${isOverlayOpen ? "active" : ""}`}
				onClick={handleOverlayClick}
			>
				<div className="overlay-content">
					<button className="close-overlay" onClick={hideOverlay}>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M18 6L6 18M6 6l12 12"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							/>
						</svg>
					</button>

					<h2 className="overlay-title">Gdzie działamy?</h2>

					<div className="cities-container">
						<div className="cities-column">
							<ul className="cities-list text-center">
								{firstColumn.map((city, index) => (
									<li key={index}>
										<a href={`/${slugify(city)}`}>{city}</a>
									</li>
								))}
							</ul>
						</div>
						<div className="cities-column">
							<ul className="cities-list text-center">
								{secondColumn.map((city, index) => (
									<li key={index}>
										<a href={`/${slugify(city)}`}>{city}</a>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default LocationsSection;
