import React from "react";

interface FaqItem {
	question: string;
	answer: string;
}

interface FaqSectionProps {
	data?: {
		items?: FaqItem[];
	};
}

const FaqSection: React.FC<FaqSectionProps> = ({ data }) => {
	const defaultItems = [
		{
			question: "Ile kosztuje wynajem fotobudki 360° w Chojnicach?",
			answer: "Cenę naszych usług ustalamy indywidualnie w zależności od czasu wynajmu i dodatkowych usług. Skontaktuj się z nami, aby uzyskać wycenę.",
		},
		{
			question: "Czy dojeżdżacie poza Chojnice? (Gdańsk, Słupsk, itp.)",
			answer: "Tak! Obsługujemy miasta poza Chojnicami.",
		},
	];

	const items = data?.items || defaultItems;

	return (
		<section
			className="faq-section full-width"
			itemScope
			itemType="https://schema.org/FAQPage"
		>
			<h2>Najczęściej zadawane pytania</h2>

			{items.map((item, index) => (
				<div
					key={index}
					className="faq-item"
					itemScope
					itemProp="mainEntity"
					itemType="https://schema.org/Question"
				>
					<details>
						<summary className="faq-question" itemProp="name">
							{item.question}
						</summary>
						<div
							className="faq-answer"
							itemScope
							itemProp="acceptedAnswer"
							itemType="https://schema.org/Answer"
						>
							<p itemProp="text">{item.answer}</p>
						</div>
					</details>
				</div>
			))}
		</section>
	);
};

export default FaqSection;
