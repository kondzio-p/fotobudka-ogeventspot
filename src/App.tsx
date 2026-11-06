import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import SitePage from "./components/Pages/SitePage";
import { loadAllPages } from "./data/pageData";
import type { PageData } from "./data/pageData";
import { isDemoMode } from "./lib/supabase";

// panel ładuje się osobno, razem z Bootstrapem, żeby nie obciążał strony
const AdminLogin = lazy(() => import("./components/Admin/AdminLogin"));
const AdminPanel = lazy(() => import("./components/Admin/AdminPanel"));
const AdminRoute = lazy(() => import("./components/Admin/AdminRoute"));

const Loader: React.FC<{ text?: string }> = ({ text = "Ładowanie..." }) => (
	<div className="page-loader" role="status">
		<span className="script">OG Events</span>
		<p>{text}</p>
	</div>
);

const PageRoute: React.FC<{ page: PageData | undefined; pages: PageData[] }> = ({ page, pages }) => {
	const location = useLocation();

	useEffect(() => {
		if (!location.hash) window.scrollTo(0, 0);
	}, [location.pathname, location.hash]);

	useEffect(() => {
		if (!page) return;
		document.title = page.seo?.title || "Fotobudka Chojnice - OG Events";
		let meta = document.querySelector('meta[name="description"]');
		if (!meta) {
			meta = document.createElement("meta");
			meta.setAttribute("name", "description");
			document.head.appendChild(meta);
		}
		meta.setAttribute("content", page.seo?.description || "");
	}, [page]);

	if (!page) return <Loader text="Strona nie została znaleziona" />;
	return <SitePage key={page.slug} page={page} pages={pages} isMain={page.slug === "/"} />;
};

const App: React.FC = () => {
	const [pages, setPages] = useState<PageData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		loadAllPages()
			.then(setPages)
			.catch((error) => console.error("Error loading pages:", error))
			.finally(() => setIsLoading(false));
	}, []);

	if (isLoading) return <Loader />;

	return (
		<Router>
			{isDemoMode && <div className="demo-badge">Podgląd lokalny: dane przykładowe</div>}
			<Suspense fallback={<Loader />}>
				<Routes>
					<Route path="/admin/login" element={<AdminLogin onLogin={() => {}} />} />
					<Route
						path="/admin/panel"
						element={
							<AdminRoute>
								<AdminPanel onLogout={() => {}} />
							</AdminRoute>
						}
					/>
					<Route path="/" element={<PageRoute page={pages.find((p) => p.slug === "/")} pages={pages} />} />
					{pages
						.filter((page) => page.slug !== "/")
						.map((page) => (
							<Route key={page.id} path={page.slug} element={<PageRoute page={page} pages={pages} />} />
						))}
					<Route path="*" element={<PageRoute page={undefined} pages={pages} />} />
				</Routes>
			</Suspense>
		</Router>
	);
};

export default App;
