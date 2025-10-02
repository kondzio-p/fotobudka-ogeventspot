import React from "react";

interface WelcomeSectionProps {
	data?: {
		welcomeText?: string;
		subtitle?: string;
	};
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ data }) => {
	const welcomeText = data?.welcomeText || "Fotobudka OG Event Spot!";
	const subtitle =
		data?.subtitle ||
		"Dopełniamy, by na Twoim wydarzeniu nie zabrakło Atrakcji!";

	React.useEffect(() => {
		const ensureVisibility = () => {
			const welcomeHeader = document.querySelector(".welcome-header");
			if (!welcomeHeader) return;

			const h2 = welcomeHeader.querySelector("h2") as HTMLElement;
			const p = welcomeHeader.querySelector("p") as HTMLElement;

			const rect = welcomeHeader.getBoundingClientRect();
			const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

			if (isVisible) {
				if (h2 && h2.style.opacity !== "1") {
					h2.style.opacity = "1";
					h2.style.transform = "translateY(0)";
					h2.style.transition =
						"all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
				}

				if (p && p.style.opacity !== "1") {
					setTimeout(() => {
						p.style.opacity = "1";
						p.style.transform = "translateY(0)";
						p.style.transition =
							"all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s";
					}, 200);
				}
			}
		};

		const timer = setTimeout(ensureVisibility, 100);
		window.addEventListener("scroll", ensureVisibility, { passive: true });

		return () => {
			clearTimeout(timer);
			window.removeEventListener("scroll", ensureVisibility);
		};
	}, []);

	const offerCards = [
		{
			id: "fotobudka-360",
			title: "Fotobudka 360",
			description:
				"Wejdź do centrum uwagi z naszą obrotową fotobudką 360°! Twórz spektakularne, dynamiczne filmy w zwolnionym tempie. Idealne na wesela, imprezy firmowe i urodziny. Gwarantujemy niezapomniane wspomnienia i mnóstwo zabawy dla wszystkich gości.",
			className: "offer-card-360",
		},
		{
			id: "fotolustro",
			title: "Fotolustro",
			description:
				"Magiczne lustro, które robi zdjęcia! Interaktywne fotolustro z animacjami i zabawnymi dodatkami. Goście mogą pozować, robić selfie i od razu drukować pamiątkowe zdjęcia. Doskonałe na każdą okazję - od eleganckich eventów po szalone imprezy.",
			className: "offer-card-mirror",
		},
		{
			id: "ciezki-dym",
			title: "Ciężki dym",
			description:
				"Stwórz bajkową atmosferę z naszym efektem ciężkiego dymu! Gęsta, biała mgła unosi się przy ziemi, tworząc magiczny klimat podczas pierwszego tańca, wejścia pary młodej czy kluczowych momentów imprezy. Całkowicie bezpieczny i spektakularny.",
			className: "offer-card-smoke",
		},
		{
			id: "fontanny-iskier",
			title: "Fontanny iskier",
			description:
				"Wybuchaj radością z naszymi fontannami iskier! Zimne ognie tworzą oszałamiające efekty świetlne bez zagrożenia. Idealne na tort weselny, pierwsze wejście czy kulminacyjne momenty imprezy. Bezpieczne, efektowne i niezapomniane dla wszystkich gości.",
			className: "offer-card-fountain",
		},
		{
			id: "neonowe-napisy",
			title: "Neonowe napisy",
			description:
				"Świeć jaśniej niż gwiazdy z naszymi neonowymi napisami LED! Personalizowane napisy z imionami, datami lub hasłami. Kolorowe podświetlenie tworzy niesamowity klimat i doskonałe tło do zdjęć. Każdy event stanie się wyjątkowy i Instagram-owy!",
			className: "offer-card-neons",
		},
	];

	return (
		<section id="welcome" className="welcome-section">
			<div className="container-fluid px-0">
				<div
					className="welcome-header text-center py-5"
					style={{ background: "rgba(255, 255, 255, 0.9)" }}
				>
					<h2
						className="mb-3"
						style={{
							opacity: 0,
							transform: "translateY(50px)",
						}}
					>
						Witamy w{" "}
						<span style={{ color: "#801039", fontWeight: "bold" }}>
							{welcomeText}
						</span>
					</h2>
					<p
						className="lead"
						style={{
							color: "#666",
							opacity: 0,
							transform: "translateY(30px)",
							fontSize: "1.25rem",
						}}
					>
						{subtitle}
					</p>
				</div>

				<div
					className="offers-section py-5"
					style={{
						background:
							"linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
					}}
				>
					<div className="container">
						<h3
							className="text-center mb-5"
							style={{ color: "#2c2c2c" }}
						>
							Nasza{" "}
							<span style={{ color: "#801039" }}>oferta</span>
						</h3>

						<div className="row g-4">
							{offerCards.map((card, index) => (
								<div
									key={card.id}
									className={`col-lg-4 col-md-6 ${
										index >= 3 && index === 3
											? "offset-lg-2"
											: ""
									}`}
								>
									<div
										className={`offer-card ${card.className} h-100`}
									>
										<div className="card-background"></div>
										<div className="card-overlay"></div>
										<div className="card-content">
											<h4>{card.title}</h4>
											<p>{card.description}</p>
										</div>
										<div className="card-title-overlay">
											<h4>{card.title}</h4>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default WelcomeSection;
