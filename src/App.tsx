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
import { getPageData, allPages } from "./data/pageData";
import type { PageData } from "./data/pageData";
import { useGSAP } from "./hooks/useGSAP";
import { useScrollAnimations } from "./hooks/useScrollAnimations";
import "./styles/admin.css";

// Background component
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

// Page wrapper component that handles GSAP animations
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const location = useLocation();
	const gsap = useGSAP();
	const scrollObserver = useScrollAnimations();

	useEffect(() => {
		// Scroll to top on page refresh/load
		window.scrollTo(0, 0);

		// Initialize base animations and setup
		const initializeAnimations = () => {
			// Set initial states for elements
			const setInitialStates = () => {
				// Welcome section
				document.querySelectorAll('.welcome-header h2').forEach((el) => {
					(el as HTMLElement).style.opacity = '0';
					(el as HTMLElement).style.transform = 'translateY(50px)';
				});

				document.querySelectorAll('.welcome-header p').forEach((el) => {
					(el as HTMLElement).style.opacity = '0';
					(el as HTMLElement).style.transform = 'translateY(30px)';
				});

				// Offer cards
				document.querySelectorAll('.offer-card').forEach((el) => {
					(el as HTMLElement).style.opacity = '0';
					(el as HTMLElement).style.transform = 'translateY(100px) rotateX(-30deg)';
				});

				// Stats cards
				document.querySelectorAll('.stat-card').forEach((el) => {
					(el as HTMLElement).style.opacity = '0';
					(el as HTMLElement).style.transform = 'translateY(-30px) scale(0.8)';
				});

				// Gallery images
				document.querySelectorAll('.image-slide').forEach((el) => {
					(el as HTMLElement).style.opacity = '0';
					(el as HTMLElement).style.transform = 'scale(0.8)';
				});

				// Contact items
				document.querySelectorAll('.contact-item').forEach((el) => {
					(el as HTMLElement).style.opacity = '0';
					(el as HTMLElement).style.transform = 'translateX(-50px)';
				});

				// Reset stat counters
				document.querySelectorAll('.stat-number').forEach((el) => {
					const finalAttr = el.getAttribute('data-final-value');
					const finalText = finalAttr ?? el.textContent ?? '';
					el.setAttribute('data-final-value', finalText);
					el.removeAttribute('data-animated');

					if (finalText.trim() === '∞') {
						el.textContent = '∞';
						return;
					}
					if (/\+$/.test(finalText)) {
						el.textContent = '0+';
						return;
					}
					if (/lat$/.test(finalText)) {
						el.textContent = '0 lat';
						return;
					}
					if (/\d/.test(finalText)) {
						el.textContent = '0';
					}
				});
			};

			setInitialStates();

			// Header entrance animation (immediate, not scroll-triggered)
			if (gsap) {
				const headerTimeline = gsap.timeline();
				headerTimeline
					.to('.nav-menu li', {
						opacity: 1,
						y: 0,
						duration: 0.6,
						stagger: 0.1,
						ease: 'back.out(1.7)',
					})
					.to(
						'.social-icons a',
						{
							opacity: 1,
							y: 0,
							rotation: 0,
							duration: 0.6,
							stagger: 0.15,
							ease: 'back.out(1.7)',
						},
						'-=0.4'
					)
					.to(
						'.photo-frame',
						{
							opacity: 1,
							scale: 1,
							rotation: (index: number) => {
								const rotations = [-8, 5, -3, 7];
								return rotations[index] || 0;
							},
							duration: 0.8,
							stagger: 0.2,
							ease: 'back.out(1.2)',
						},
						'-=0.2'
					);
			} else {
				// Fallback without GSAP
				document.querySelectorAll('.nav-menu li').forEach((el, index) => {
					setTimeout(() => {
						(el as HTMLElement).style.opacity = '1';
						(el as HTMLElement).style.transform = 'translateY(0)';
						(el as HTMLElement).style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
					}, index * 100);
				});

				document.querySelectorAll('.social-icons a').forEach((el, index) => {
					setTimeout(() => {
						(el as HTMLElement).style.opacity = '1';
						(el as HTMLElement).style.transform = 'translateY(0) rotate(0deg)';
						(el as HTMLElement).style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
					}, 400 + index * 150);
				});

				// Animate photo frames without GSAP
				document.querySelectorAll('.photo-frame').forEach((el, index) => {
					const rotations = [-8, 5, -3, 7];
					setTimeout(() => {
						(el as HTMLElement).style.opacity = '1';
						(el as HTMLElement).style.transform = `scale(1) rotate(${rotations[index] || 0}deg)`;
						(el as HTMLElement).style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
					}, 600 + index * 200);
				});
			}
		};

		const timer = setTimeout(initializeAnimations, 200);
		return () => clearTimeout(timer);
	}, [location.pathname, gsap, scrollObserver]);

	return <>{children}</>;
};

// Wrapper component for subpage layout
const SubPageLayout: React.FC<{ data: PageData }> = ({ data }) => (
	<>
		<Header data={data.navigation} />
		<SubPage data={data} />
		<Footer data={data.footer} />
	</>
);

// Main App component
const App: React.FC = () => {
	const [isAdminAuthenticated, setIsAdminAuthenticated] =
		React.useState(false);

	React.useEffect(() => {
		const authStatus = localStorage.getItem("adminAuthenticated");
		setIsAdminAuthenticated(authStatus === "true");
	}, []);

	const handleAdminLogin = (isAuthenticated: boolean) => {
		setIsAdminAuthenticated(isAuthenticated);
	};

	const handleAdminLogout = () => {
		setIsAdminAuthenticated(false);
	};

	return (
		<Router>
			<div className="min-h-screen">
				<Routes>
					{/* Admin Routes */}
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

					{/* Public Routes */}
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
												<>
													<Header
														data={
															getPageData("/")
																?.navigation
														}
													/>
													<MainPage
														data={getPageData("/")}
													/>
													<Footer
														data={
															getPageData("/")
																?.footer
														}
													/>
												</>
											}
										/>
										{/* Dynamic routes for subpages */}
										{allPages
											.filter((page) => page.slug !== "/")
											.map((page) => (
												<Route
													key={page.id}
													path={page.slug}
													element={
														<SubPageLayout
															data={page}
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

export default App;