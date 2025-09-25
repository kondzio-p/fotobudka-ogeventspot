import React from "react";

interface StatsSectionProps {
	data?: {
		clientsCount?: string;
		yearsOnMarket?: string;
		smilesCount?: string;
	};
}

const StatsSection: React.FC<StatsSectionProps> = ({ data }) => {
	// Statystyki są wspólne dla całej strony (nieedytowalne w panelu)
	const stats = [
		{
			number: data?.clientsCount || "200+",
			label: "zadowolonych klientów",
		},
		{ number: data?.yearsOnMarket || "5 lat", label: "na rynku" },
		{ number: data?.smilesCount || "∞", label: "uśmiechów" },
	];

	return (
		<section
			className="stats-section py-5"
			style={{
				background: "rgba(255, 255, 255, 0.95)",
				borderBottomLeftRadius: "70px",
			}}
			id="stats"
		>
			<div className="container">
				<div className="text-center mb-5">
					<h3 style={{ color: "#2c2c2c" }}>
						<span style={{ color: "#801039" }}>My</span> w liczbach
					</h3>
				</div>

				<div className="row justify-content-center g-4">
					{stats.map((stat, index) => (
						<div key={index} className="col-lg-3 col-md-4 col-sm-6">
							<div
								className="stat-card text-center p-4"
								style={{
									background: "#801039",
									color: "white",
									borderRadius: "15px",
									boxShadow:
										"0 8px 25px rgba(139, 75, 122, 0.3)",
									transition: "transform 0.3s ease",
								}}
							>
								<div
									className="stat-number"
									style={{
										fontSize: "48px",
										fontWeight: "bold",
										marginBottom: "10px",
									}}
									data-final-value={stat.number}
								>
									{stat.number}
								</div>
								<div
									className="stat-label"
									style={{
										fontSize: "16px",
										fontWeight: 500,
									}}
								>
									{stat.label}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default StatsSection;
