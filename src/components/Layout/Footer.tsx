import React from "react";

interface FooterProps {
	data?: {
		facebookUrl?: string;
		facebookText?: string;
		instagramUrl?: string;
		instagramText?: string;
		phoneNumber?: string;
	};
}

const Footer: React.FC<FooterProps> = ({ data }) => {
	const facebookUrl =
		data?.facebookUrl ||
		"https://www.facebook.com/profile.php?id=61553668165091";
	const facebookText = data?.facebookText || "@OG Eventspot";
	const instagramUrl =
		data?.instagramUrl || "https://www.instagram.com/og.eventspot/";
	const instagramText = data?.instagramText || "@og.eventspot";
	const phoneNumber = data?.phoneNumber || "576 934 594";

	return (
		<footer
			className="contact-footer"
			style={{
				background: "#eec9d2",
				padding: "60px 0 40px 0",
				position: "relative",
				marginTop: 0,
			}}
			id="contact"
		>
			<div className="container">
				<div className="row">
					<div className="col-lg-8">
						<h3
							style={{
								color: "#801039",
								fontSize: "24px",
								marginBottom: "40px",
								lineHeight: 1.2,
							}}
						>
							Dotrzyj do nas za pomocą
						</h3>

						<div className="contact-info">
							<div
								className="contact-item"
								style={{
									display: "flex",
									alignItems: "center",
									marginBottom: "25px",
									fontSize: "16px",
									color: "#2c2c2c",
								}}
							>
								<div
									style={{
										width: "40px",
										height: "40px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										marginRight: "20px",
									}}
								>
									<img
										src="/assets/main/images/fb.svg"
										alt="Facebook"
										style={{
											width: "32px",
											height: "32px",
										}}
									/>
								</div>
								<a
									href={facebookUrl}
									target="_blank"
									rel="noopener noreferrer"
									style={{
										fontWeight: 500,
										color: "#2c2c2c",
										textDecoration: "none",
									}}
									onMouseOver={(e) =>
										(e.currentTarget.style.color =
											"#801039")
									}
									onMouseOut={(e) =>
										(e.currentTarget.style.color =
											"#2c2c2c")
									}
								>
									{facebookText}
								</a>
							</div>

							<div
								className="contact-item"
								style={{
									display: "flex",
									alignItems: "center",
									marginBottom: "25px",
									fontSize: "16px",
									color: "#2c2c2c",
								}}
							>
								<div
									style={{
										width: "40px",
										height: "40px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										marginRight: "20px",
									}}
								>
									<img
										src="/assets/main/images/insta.svg"
										alt="Instagram"
										style={{
											width: "32px",
											height: "32px",
										}}
									/>
								</div>
								<a
									href={instagramUrl}
									target="_blank"
									rel="noopener noreferrer"
									style={{
										fontWeight: 500,
										color: "#2c2c2c",
										textDecoration: "none",
									}}
									onMouseOver={(e) =>
										(e.currentTarget.style.color =
											"#801039")
									}
									onMouseOut={(e) =>
										(e.currentTarget.style.color =
											"#2c2c2c")
									}
								>
									{instagramText}
								</a>
							</div>

							<div
								className="contact-item"
								style={{
									display: "flex",
									alignItems: "center",
									marginBottom: "25px",
									fontSize: "16px",
									color: "#2c2c2c",
								}}
							>
								<div
									style={{
										width: "40px",
										height: "40px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										marginRight: "20px",
									}}
								>
									<img
										src="/assets/main/images/phone.svg"
										alt="Phone"
										style={{
											width: "32px",
											height: "32px",
										}}
									/>
								</div>
								<a
									href={`tel:${phoneNumber.replace(
										/\s/g,
										""
									)}`}
									style={{
										fontWeight: 500,
										color: "#2c2c2c",
										textDecoration: "none",
									}}
									onMouseOver={(e) =>
										(e.currentTarget.style.color =
											"#801039")
									}
									onMouseOut={(e) =>
										(e.currentTarget.style.color =
											"#2c2c2c")
									}
								>
									{phoneNumber}
								</a>
							</div>
						</div>
					</div>

					<div className="col-lg-4 d-flex align-items-center justify-content-center">
						<div
							style={{
								textAlign: "right",
								color: "#666",
								fontSize: "14px",
								fontWeight: 400,
							}}
						>
							© 2025 - Wszelkie prawa zastrzeżone
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
