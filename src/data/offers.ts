export interface Offer {
	title: string;
	text: string;
	image: string;
	width: number;
	height: number;
	alt: string;
}

export const offers: Offer[] = [
	{
		title: "Fotobudka 360°",
		text: "Obrotowa platforma i dynamiczne filmy w zwolnionym tempie. Idealna na wesela, imprezy firmowe i urodziny.",
		image: "/assets/main/images/360.webp",
		width: 908,
		height: 1259,
		alt: "Fotobudka 360 na weselu",
	},
	{
		title: "Fotolustro",
		text: "Magiczne lustro, które robi zdjęcia. Animacje, zabawne dodatki i wydruki od ręki dla każdego gościa.",
		image: "/assets/main/images/mirror.webp",
		width: 1536,
		height: 2048,
		alt: "Fotolustro z wydrukami zdjęć",
	},
	{
		title: "Ciężki dym",
		text: "Gęsta, biała mgła przy ziemi i bajkowy klimat pierwszego tańca. Całkowicie bezpieczny i spektakularny.",
		image: "/assets/main/images/heavysmoke.webp",
		width: 2048,
		height: 1366,
		alt: "Ciężki dym podczas pierwszego tańca",
	},
	{
		title: "Fontanny iskier",
		text: "Zimne ognie bez zagrożenia. Piękny efekt przy torcie, wejściu pary młodej i najważniejszych momentach.",
		image: "/assets/main/images/fountain.webp",
		width: 2048,
		height: 1536,
		alt: "Fontanny iskier na weselu",
	},
	{
		title: "Neony LED",
		text: "Napisy z imionami, datą albo hasłem. Ciepłe światło i najlepsze tło do zdjęć na całej sali.",
		image: "/assets/main/images/neons.webp",
		width: 2000,
		height: 1500,
		alt: "Neonowy napis LED",
	},
];
