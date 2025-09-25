import React, { useState, useEffect } from "react";

interface ImageGalleryProps {
	data?: {
		images?: Array<{
			src: string;
			alt: string;
		}>;
	};
}

const ImageGallerySection: React.FC<ImageGalleryProps> = ({ data }) => {
	const [currentIndex, setCurrentIndex] = useState(1);
	const [isAnimating, setIsAnimating] = useState(false);
	const [imagesLoaded, setImagesLoaded] = useState(false);

	const defaultImages = [
		{ src: "/assets/main/images/360.png", alt: "Gallery image 1" },
		{ src: "/assets/main/images/mirror.jpg", alt: "Gallery image 2" },
		{ src: "/assets/main/images/heavysmoke.jpg", alt: "Gallery image 3" },
		{ src: "/assets/main/images/fountain.jpg", alt: "Gallery image 4" },
		{ src: "/assets/main/images/neons.jpg", alt: "Gallery image 5" },
	];

	const images = data?.images || defaultImages;
	const totalImages = images.length;

	useEffect(() => {
		let loadedCount = 0;
		const imagePromises = images.map((img) => {
			return new Promise<void>((resolve, reject) => {
				const image = new Image();
				image.onload = () => {
					loadedCount++;
					if (loadedCount === images.length) {
						setImagesLoaded(true);
						setTimeout(() => {
							const imageSlides =
								document.querySelectorAll(".image-slide");
							imageSlides.forEach((slide) => {
								const rect = slide.getBoundingClientRect();
								const isVisible =
									rect.top < window.innerHeight &&
									rect.bottom > 0;
								if (isVisible) {
									(slide as HTMLElement).style.opacity = "1";
									(slide as HTMLElement).style.transform =
										"scale(1)";
								}
							});
						}, 100);
					}
					resolve();
				};
				image.onerror = () => {
					console.warn(`Failed to load image: ${img.src}`);
					loadedCount++;
					if (loadedCount === images.length) {
						setImagesLoaded(true);
						setTimeout(() => {
							const imageSlides =
								document.querySelectorAll(".image-slide");
							imageSlides.forEach((slide) => {
								const rect = slide.getBoundingClientRect();
								const isVisible =
									rect.top < window.innerHeight &&
									rect.bottom > 0;
								if (isVisible) {
									(slide as HTMLElement).style.opacity = "1";
									(slide as HTMLElement).style.transform =
										"scale(1)";
								}
							});
						}, 100);
					}
					resolve();
				};
				image.src = img.src;
			});
		});

		Promise.all(imagePromises).catch(() => {
			setImagesLoaded(true);
		});
	}, [images]);

	const nextImage = () => {
		if (isAnimating) return;
		setIsAnimating(true);
		setCurrentIndex((prev) => (prev + 1) % totalImages);
		setTimeout(() => setIsAnimating(false), 600);
	};

	const prevImage = () => {
		if (isAnimating) return;
		setIsAnimating(true);
		setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
		setTimeout(() => setIsAnimating(false), 600);
	};

	const getImageIndex = (position: "left" | "center" | "right") => {
		switch (position) {
			case "left":
				return (currentIndex - 1 + totalImages) % totalImages;
			case "center":
				return currentIndex;
			case "right":
				return (currentIndex + 1) % totalImages;
			default:
				return currentIndex;
		}
	};

	useEffect(() => {
		if (!imagesLoaded) return;

		const interval = setInterval(() => {
			if (!isAnimating) {
				nextImage();
			}
		}, 6000);

		return () => clearInterval(interval);
	}, [isAnimating, imagesLoaded]);

	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const target = e.target as HTMLImageElement;

		if (target.dataset.errorHandled) return;
		target.dataset.errorHandled = "true";

		const altText = target.alt || "Gallery image";

		const placeholder = document.createElement("div");
		placeholder.style.cssText =
			"width: 100%; height: 100%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999; font-size: 14px; border-radius: 15px;";
		placeholder.textContent = altText;

		if (target.parentNode) {
			target.parentNode.replaceChild(placeholder, target);
		}
	};

	return (
		<section
			className="image-gallery-section py-5"
			style={{ background: "rgba(139, 75, 122, 0.1)" }}
		>
			<div className="container">
				<div className="text-center mb-5">
					<h3 style={{ color: "#2c2c2c" }}>
						Nasza <span style={{ color: "#801039" }}>galeria</span>
					</h3>
				</div>

				{!imagesLoaded && (
					<div className="text-center mb-4">
						<div style={{ color: "#666", fontSize: "14px" }}>
							Ładowanie galerii...
						</div>
					</div>
				)}

				<div className="image-carousel-container">
					<button
						className="carousel-arrow carousel-arrow-left"
						aria-label="Poprzedni slajd"
						onClick={prevImage}
						disabled={!imagesLoaded}
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M15 18L9 12L15 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>

					<div className="image-carousel">
						<div className="image-slide image-slide-left">
							<img
								src={images[getImageIndex("left")]?.src}
								alt={images[getImageIndex("left")]?.alt}
								onError={handleImageError}
								style={{ opacity: imagesLoaded ? 1 : 0 }}
							/>
						</div>
						<div className="image-slide image-slide-center active">
							<img
								src={images[getImageIndex("center")]?.src}
								alt={images[getImageIndex("center")]?.alt}
								onError={handleImageError}
								style={{ opacity: imagesLoaded ? 1 : 0 }}
							/>
						</div>
						<div className="image-slide image-slide-right">
							<img
								src={images[getImageIndex("right")]?.src}
								alt={images[getImageIndex("right")]?.alt}
								onError={handleImageError}
								style={{ opacity: imagesLoaded ? 1 : 0 }}
							/>
						</div>
					</div>

					<button
						className="carousel-arrow carousel-arrow-right"
						aria-label="Następny slajd"
						onClick={nextImage}
						disabled={!imagesLoaded}
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M9 18L15 12L9 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
			</div>
		</section>
	);
};

export default ImageGallerySection;
