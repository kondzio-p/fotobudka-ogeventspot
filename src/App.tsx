import React, { useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";
import AdminLogin from "./components/Admin/AdminLogin";
import AdminPanel from "./components/Admin/AdminPanel";
import AdminRoute from "./components/Admin/AdminRoute";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import MainPage from "./components/Pages/MainPage";
import SubPage from "./components/Pages/SubPage";
import { getPageData, loadAllPages } from "./data/pageData";
import type { PageData } from "./data/pageData";
import { useGSAP } from "./hooks/useGSAP";
import { useScrollAnimations } from "./hooks/useScrollAnimations";
import "./styles/admin.css";

const Background: React.FC = () => (
	<div
		id="background-fixed"
		style={{
			position: "fixed",
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
			backgroundImage:
				'url("/assets/main/images/bgKamien.webp"), url("/assets/main/images/bgKamien.jpg")',
			backgroundSize: "cover",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			zIndex: -1,
		}}
	/>
);

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const location = useLocation();
	const gsap = useGSAP();
	const scrollObserver = useScrollAnimations();

	useEffect(() => {
		window.scrollTo(0, 0);

		const initializeAnimations = () => {
			const setInitialStates = () => {
				document
					.querySelectorAll(".welcome-header h2")
					.forEach((el) => {
						(el as HTMLElement).style.opacity = "0";
						(el as HTMLElement).style.transform =
							"translateY(50px)";
					});

				document.querySelectorAll(".welcome-header p").forEach((el) => {
					(el as HTMLElement).style.opacity = "0";
					(el as HTMLElement).style.transform = "translateY(30px)";
				});

				document.querySelectorAll(".offer-card").forEach((el) => {
					(el as HTMLElement).style.opacity = "0";
					(el as HTMLElement).style.transform =
						"translateY(100px) rotateX(-30deg)";
				});

				document.querySelectorAll(".stat-card").forEach((el) => {
					(el as HTMLElement).style.opacity = "0";
					(el as HTMLElement).style.transform =
						"translateY(-30px) scale(0.8)";
				});

				document.querySelectorAll(".image-slide").forEach((el) => {
					(el as HTMLElement).style.opacity = "0";
					(el as HTMLElement).style.transform = "scale(0.8)";
				});

				document.querySelectorAll(".contact-item").forEach((el) => {
					(el as HTMLElement).style.opacity = "0";
					(el as HTMLElement).style.transform = "translateX(-50px)";
				});

				document.querySelectorAll(".stat-number").forEach((el) => {
					const finalAttr = el.getAttribute("data-final-value");
					const finalText = finalAttr ?? el.textContent ?? "";
					el.setAttribute("data-final-value", finalText);
					el.removeAttribute("data-animated");

					if (finalText.trim() === "∞") {
						el.textContent = "∞";
						return;
					}
					if (/\+$/.test(finalText)) {
						el.textContent = "0+";
						return;
					}
					if (/lat$/.test(finalText)) {
						el.textContent = "0 lat";
						return;
					}
					if (/\d/.test(finalText)) {
						el.textContent = "0";
					}
				});
			};

			setInitialStates();

			if (gsap) {
				const headerTimeline = gsap.timeline();
				headerTimeline
					.to(".nav-menu li", {
						opacity: 1,
						y: 0,
						duration: 0.6,
						stagger: 0.1,
						ease: "back.out(1.7)",
					})
					.to(
						".social-icons a",
						{
							opacity: 1,
							y: 0,
							rotation: 0,
							duration: 0.6,
							stagger: 0.15,
							ease: "back.out(1.7)",
						},
						"-=0.4"
					)
					.to(
						".photo-frame",
						{
							opacity: 1,
							scale: 1,
							rotation: (index: number) => {
								const rotations = [-8, 5, -3, 7];
								return rotations[index] || 0;
							},
							duration: 0.8,
							stagger: 0.2,
							ease: "back.out(1.2)",
						},
						"-=0.2"
					);
			} else {
				document
					.querySelectorAll(".nav-menu li")
					.forEach((el, index) => {
						setTimeout(() => {
							(el as HTMLElement).style.opacity = "1";
							(el as HTMLElement).style.transform =
								"translateY(0)";
							(el as HTMLElement).style.transition =
								"all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
						}, index * 100);
					});

				document
					.querySelectorAll(".social-icons a")
					.forEach((el, index) => {
						setTimeout(() => {
							(el as HTMLElement).style.opacity = "1";
							(el as HTMLElement).style.transform =
								"translateY(0) rotate(0deg)";
							(el as HTMLElement).style.transition =
								"all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
						}, 400 + index * 150);
					});

				document
					.querySelectorAll(".photo-frame")
					.forEach((el, index) => {
						const rotations = [-8, 5, -3, 7];
						setTimeout(() => {
							(el as HTMLElement).style.opacity = "1";
							(
								el as HTMLElement
							).style.transform = `scale(1) rotate(${
								rotations[index] || 0
							}deg)`;
							(el as HTMLElement).style.transition =
								"all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
						}, 600 + index * 200);
					});
			}
		};

		const timer = setTimeout(initializeAnimations, 200);
		return () => clearTimeout(timer);
	}, [location.pathname, gsap, scrollObserver]);

	return <>{children}</>;
};

const SubPageLayout: React.FC<{ data: PageData }> = ({ data }) => (
	<>
		<Header data={data.navigation} />
		<SubPage data={data} />
		<Footer data={data.footer} />
	</>
);

const App: React.FC = () => {
	const [isAdminAuthenticated, setIsAdminAuthenticated] =
		React.useState(false);
	const [pages, setPages] = React.useState<PageData[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		// Load pages from database
		const loadPages = async () => {
			try {
				const pagesData = await loadAllPages();
				setPages(pagesData);
			} catch (error) {
				console.error("Error loading pages:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPages();
	}, []);

	const handleAdminLogin = (isAuthenticated: boolean) => {
		setIsAdminAuthenticated(isAuthenticated);
	};

	const handleAdminLogout = () => {
		setIsAdminAuthenticated(false);
	};

	if (isLoading) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100vh",
					fontSize: "18px",
					color: "#666",
				}}
			>
				Ładowanie...
			</div>
		);
	}
	return (
		<Router>
			<div className="min-h-screen">
				<Routes>
					<Route
						path="/admin/login"
						element={<AdminLogin onLogin={handleAdminLogin} />}
					/>
					<Route
						path="/admin/panel"
						element={
							<AdminRoute>
								<AdminPanel onLogout={handleAdminLogout} />
							</AdminRoute>
						}
					/>

					<Route
						path="/*"
						element={
							<>
								<Background />
								<PageWrapper>
									<Routes>
										<Route
											path="/"
											element={
												<PageRoute
													slug="/"
													pages={pages}
													isMain={true}
												/>
											}
										/>
										{pages
											.filter((page) => page.slug !== "/")
											.map((page) => (
												<Route
													key={page.id}
													path={page.slug}
													element={
														<PageRoute
															slug={page.slug}
															pages={pages}
															isMain={false}
														/>
													}
												/>
											))}
									</Routes>
								</PageWrapper>
							</>
						}
					/>
				</Routes>
			</div>
		</Router>
	);
};

const PageRoute: React.FC<{
	slug: string;
	pages: PageData[];
	isMain: boolean;
}> = ({ slug, pages, isMain }) => {
	const [pageData, setPageData] = React.useState<PageData | null>(null);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const loadPageData = async () => {
			try {
				const data = await getPageData(slug);
				setPageData(data || null);
			} catch (error) {
				console.error("Error loading page data:", error);
				setPageData(null);
			} finally {
				setIsLoading(false);
			}
		};

		loadPageData();
	}, [slug]);

	React.useEffect(() => {
		if (pageData) {
			document.title =
				pageData.seo?.title || "Fotobudka Chojnice - OG Events";
			const meta = document.querySelector('meta[name="description"]');
			if (meta) {
				meta.setAttribute("content", pageData.seo?.description || "");
			} else if (pageData.seo?.description) {
				const m = document.createElement("meta");
				m.setAttribute("name", "description");
				m.setAttribute("content", pageData.seo.description);
				document.head.appendChild(m);
			}
		}
	}, [pageData]);

	if (isLoading) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100vh",
					fontSize: "18px",
					color: "#666",
				}}
			>
				Ładowanie strony...
			</div>
		);
	}

	if (!pageData) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100vh",
					fontSize: "18px",
					color: "#666",
				}}
			>
				Strona nie została znaleziona
			</div>
		);
	}

	return (
		<>
			<Header data={pageData.navigation} />
			{isMain ? (
				<MainPage data={pageData} />
			) : (
				<SubPage data={pageData} />
			)}
			<Footer data={pageData.footer} />
		</>
	);
};

export default App;
