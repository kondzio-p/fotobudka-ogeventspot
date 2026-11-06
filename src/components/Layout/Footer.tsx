import React from "react";
import { Link } from "react-router-dom";
import type { PageData } from "../../data/pageData";
import { telHref } from "./Header";

interface FooterProps {
	data: PageData["footer"];
	cityPages: PageData[];
}

const Footer: React.FC<FooterProps> = ({ data, cityPages }) => (
	<footer id="kontakt" className="site-footer">
		<div className="footer-cta">
			<p className="script">do zobaczenia na parkiecie</p>
			<h2 className="footer-title">
				Sprawdź, czy Twój termin <em>jest wolny</em>
			</h2>
			<a className="footer-phone" href={telHref(data.phoneNumber)}>
				{data.phoneNumber}
			</a>
			<div className="footer-social">
				{data.facebookUrl && (
					<a href={data.facebookUrl} target="_blank" rel="noopener">
						Facebook · {data.facebookText}
					</a>
				)}
				{data.instagramUrl && (
					<a href={data.instagramUrl} target="_blank" rel="noopener">
						Instagram · {data.instagramText}
					</a>
				)}
			</div>
		</div>

		<div className="footer-bottom">
			{cityPages.length > 0 && (
				<nav className="footer-services" aria-label="Fotobudka w Twoim mieście">
					{cityPages.map((p) => (
						<Link key={p.id} to={p.slug}>
							Fotobudka {p.name}
						</Link>
					))}
				</nav>
			)}
			<div className="footer-meta">
				<a className="footer-credit" href="https://kdzki.pl/" target="_blank" rel="noopener" aria-label="Kdzki, strony internetowe">
					<img src="/assets/main/images/logoKdzki.webp" width={2436} height={752} alt="Kdzki" loading="lazy" />
				</a>
				<span>© {new Date().getFullYear()} OG Events. Wszelkie prawa zastrzeżone.</span>
			</div>
		</div>
	</footer>
);

export default Footer;
