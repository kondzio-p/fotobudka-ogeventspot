import React from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
	phone: string;
}

export const telHref = (phone: string) => "tel:+48" + phone.replace(/\D/g, "").replace(/^48(?=\d{9}$)/, "");

const Header: React.FC<HeaderProps> = ({ phone }) => (
	<header className="site-header">
		<div className="nav-pill">
			<Link className="nav-logo" to="/" aria-label="OG Events, strona główna">
				<img src="/assets/main/images/og-events-logo-white.webp" width={397} height={227} alt="OG Events" />
			</Link>
			<nav className="nav-links" aria-label="Menu główne">
				<a href="#oferta">Oferta</a>
				<a href="#galeria">Galeria</a>
				<a href="#faq">Pytania</a>
				<a href="#kontakt">Kontakt</a>
			</nav>
			<a className="nav-cta" href={telHref(phone)}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
					<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
				</svg>
				<span>{phone}</span>
			</a>
		</div>
	</header>
);

export default Header;
