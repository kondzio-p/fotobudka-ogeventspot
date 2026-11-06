import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/admin.css";
import { useNavigate } from "react-router-dom";
import {
	PageData,
	loadAllPages,
	updatePageData,
	addNewSubPage,
	removeSubPage,
} from "../../data/pageData";
import { supabase } from "../../lib/supabase";

interface AdminPanelProps {
	onLogout: () => void;
}

type MediaItem = {
	id: string;
	name: string;
	type: "image" | "video" | "other";
	path: string;
	preview?: string;
};

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
	const [activeTab, setActiveTab] = useState<"pages" | "media">("pages");

	const [currentPageId, setCurrentPageId] = useState("main");
	const [currentPageData, setCurrentPageData] = useState<PageData | null>(
		null
	);
	const [pages, setPages] = useState<PageData[]>([]);
	const [isLoadingPages, setIsLoadingPages] = useState(true);

	const [showAddPageModal, setShowAddPageModal] = useState(false);
	const [newPageName, setNewPageName] = useState("");
	const [newPageSlug, setNewPageSlug] = useState("");

	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState("");

	const [media, setMedia] = useState<MediaItem[]>(() => {
		try {
			return JSON.parse(localStorage.getItem("mediaLibrary") || "[]");
		} catch {
			return [];
		}
	});

	const navigate = useNavigate();

	// Load pages from database
	const loadPages = async () => {
		try {
			setIsLoadingPages(true);
			const pagesData = await loadAllPages();
			setPages(pagesData);

			// Set current page to main if not set or if current page doesn't exist
			if (
				!currentPageId ||
				!pagesData.find((p) => p.id === currentPageId)
			) {
				const mainPage = pagesData.find((p) => p.slug === "/");
				if (mainPage) {
					setCurrentPageId(mainPage.id);
				}
			}
		} catch (error) {
			console.error("Error loading pages:", error);
		} finally {
			setIsLoadingPages(false);
		}
	};

	useEffect(() => {
		loadPages();
	}, []);
	const saveMedia = (items: MediaItem[]) => {
		setMedia(items);
		localStorage.setItem("mediaLibrary", JSON.stringify(items));
	};

	const handleFileUpload = async (
		file: File,
		targetPath: string
	): Promise<string> => {
		try {
			// Use FormData for file upload
			const formData = new FormData();
			formData.append("file", file);

			// Determine media type and category from targetPath
			const pathParts = targetPath.split("/").filter((part) => part);
			const mediaType = pathParts.includes("main") ? "main" : "subpages";
			const category = pathParts[pathParts.length - 1]; // 'images' or 'videos'

			formData.append("mediaType", mediaType);
			formData.append("category", category);

			// Upload file to backend
			const response = await fetch("/api/upload-file", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to upload file");
			}

			const result = await response.json();
			return result.path;
		} catch (error) {
			console.error("Error uploading file:", error);
			alert("Błąd wysyłania pliku: " + (error as Error).message);
			throw error;
		}
	};

	useEffect(() => {
		const pageData = pages.find((p) => p.id === currentPageId);
		setCurrentPageData(pageData || null);
	}, [currentPageId, pages]);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		onLogout?.();
		navigate("/admin/login", { replace: true });
	};

	const handlePageSelect = (pageId: string) => {
		setCurrentPageId(pageId);
	};

	const handleInputChange = (
		field: keyof PageData,
		value: any,
		subField?: string
	) => {
		if (!currentPageData) return;
		const updatedData: PageData = JSON.parse(
			JSON.stringify(currentPageData)
		);
		if (subField) {
			// @ts-ignore
			updatedData[field][subField] = value;
		} else {
			// @ts-ignore
			updatedData[field] = value;
		}
		setCurrentPageData(updatedData);
	};

	const getByPath = (obj: any, path: string) =>
		path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);

	const setByPath = (obj: any, path: string, updater: (ref: any) => void) => {
		const keys = path.split(".");
		const last = keys.pop()!;
		const parent = keys.reduce((acc, key) => (acc[key] ??= {}), obj);
		updater(parent[last]);
	};

	const handleArrayChange = (
		field: keyof PageData,
		index: number,
		value: any,
		subField?: string
	) => {
		if (!currentPageData) return;
		const updatedData: PageData = JSON.parse(
			JSON.stringify(currentPageData)
		);
		const arr = (updatedData as any)[field];
		if (Array.isArray(arr)) {
			if (subField) {
				arr[index][subField] = value;
			} else {
				arr[index] = value;
			}
			setCurrentPageData(updatedData);
		}
	};

	const handleNestedArrayChange = (
		path: "gallery.images" | "locations.cities",
		index: number,
		value: any,
		subField?: string
	) => {
		if (!currentPageData) return;
		const updatedData: PageData = JSON.parse(
			JSON.stringify(currentPageData)
		);
		const arr = getByPath(updatedData, path);
		if (Array.isArray(arr)) {
			if (subField) {
				arr[index][subField] = value;
			} else {
				arr[index] = value;
			}
			setCurrentPageData(updatedData);
		}
	};

	const handleAddArrayItem = (field: keyof PageData, defaultItem: any) => {
		if (!currentPageData) return;
		const updatedData: PageData = JSON.parse(
			JSON.stringify(currentPageData)
		);
		(updatedData as any)[field].push(defaultItem);
		setCurrentPageData(updatedData);
	};

	const handleAddNestedArrayItem = (
		path: "gallery.images" | "locations.cities",
		defaultItem: any
	) => {
		if (!currentPageData) return;
		const updatedData: PageData = JSON.parse(
			JSON.stringify(currentPageData)
		);
		setByPath(updatedData, path, (ref) => {
			if (Array.isArray(ref)) {
				ref.push(defaultItem);
			}
		});
		setCurrentPageData(updatedData);
	};

	const handleRemoveArrayItem = (field: keyof PageData, index: number) => {
		if (!currentPageData) return;
		const updatedData: PageData = JSON.parse(
			JSON.stringify(currentPageData)
		);
		(updatedData as any)[field].splice(index, 1);
		setCurrentPageData(updatedData);
	};

	const handleRemoveNestedArrayItem = (
		path: "gallery.images" | "locations.cities",
		index: number
	) => {
		if (!currentPageData) return;
		const updatedData: PageData = JSON.parse(
			JSON.stringify(currentPageData)
		);
		const arr = getByPath(updatedData, path);
		if (Array.isArray(arr)) arr.splice(index, 1);
		setCurrentPageData(updatedData);
	};

	const handleSave = async () => {
		if (!currentPageData) return;
		setIsSaving(true);
		setSaveMessage("");
		try {
			const success = await updatePageData(
				currentPageData.id,
				currentPageData
			);
			if (success) {
				setSaveMessage("Zmiany zostały zapisane pomyślnie!");
				// Reload pages to get fresh data
				await loadPages();
			} else {
				setSaveMessage("Błąd podczas zapisywania zmian.");
			}
			setTimeout(() => setSaveMessage(""), 3000);
		} catch (error) {
			console.error("Save error:", error);
			setSaveMessage("Błąd podczas zapisywania zmian.");
			setTimeout(() => setSaveMessage(""), 3000);
		} finally {
			setIsSaving(false);
		}
	};

	const handleAddPage = async () => {
		if (!newPageName.trim() || !newPageSlug.trim()) return;

		setIsSaving(true);
		try {
			const slug = newPageSlug.startsWith("/")
				? newPageSlug
				: `/${newPageSlug}`;

			const newPage = await addNewSubPage(newPageName, slug);
			if (newPage) {
				await loadPages(); // Reload pages
				setCurrentPageId(newPage.id);
				setNewPageName("");
				setNewPageSlug("");
				setShowAddPageModal(false);
			} else {
				alert("Błąd podczas dodawania strony");
			}
		} catch (error) {
			console.error("Error adding page:", error);
			alert("Błąd podczas dodawania strony");
		} finally {
			setIsSaving(false);
		}
	};

	const generateSlugFromName = (name: string) =>
		name
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.trim()
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");

	const handlePageNameChange = (value: string) => {
		setNewPageName(value);
		if (!newPageSlug) setNewPageSlug(generateSlugFromName(value));
	};

	const handleRemovePage = async (pageId: string) => {
		try {
			const success = await removeSubPage(pageId);
			if (success) {
				await loadPages(); // Reload pages
				// Set current page to main
				const mainPage = pages.find((p) => p.slug === "/");
				if (mainPage) {
					setCurrentPageId(mainPage.id);
				}
			} else {
				alert("Błąd podczas usuwania strony");
			}
		} catch (error) {
			console.error("Error removing page:", error);
			alert("Błąd podczas usuwania strony");
		}
	};

	if (isLoadingPages || (!currentPageData && activeTab === "pages")) {
		return <div className="admin-loading">Ładowanie...</div>;
	}

	return (
		<div className="admin-container">
			<div className="admin-sidebar">
				<div className="admin-sidebar-header">
					<div className="admin-logo">
						<img src="/assets/main/images/og-events-logo-white.webp" alt="OG Events" width="110" />
					</div>
					<h5>Panel Administracyjny</h5>
				</div>

				<nav className="admin-nav">
					<div className="admin-tabs">
					<button
						className={`admin-nav-item ${
							activeTab === "pages" ? "active" : ""
						}`}
						onClick={() => setActiveTab("pages")}
					>
						Strony
					</button>
					<button
						className={`admin-nav-item ${
							activeTab === "media" ? "active" : ""
						}`}
						onClick={() => setActiveTab("media")}
					>
						Pliki
					</button>
					</div>

					{activeTab === "pages" && (
						<>
							{pages.map((page) => (
								<div key={page.id} className="admin-page-row">
									<button
										className={`admin-nav-item ${
											currentPageId === page.id
												? "active"
												: ""
										}`}
										onClick={() =>
											handlePageSelect(page.id)
										}
									>
										<span>{page.name}</span>
										<small>{page.slug}</small>
									</button>
									{page.slug !== "/" && (
										<button
											className="admin-page-remove"
											title="Usuń podstronę"
											aria-label={`Usuń podstronę ${page.name}`}
											onClick={() => {
												if (
													confirm(
														`Usunąć podstronę „${page.name}"?`
													)
												) {
													handleRemovePage(page.id);
												}
											}}
										>
											×
										</button>
									)}
								</div>
							))}
							<button
								className="admin-nav-item add-page"
								onClick={() => setShowAddPageModal(true)}
							>
								+ Dodaj podstronę
							</button>
						</>
					)}
				</nav>

				<div className="admin-sidebar-footer">
					<a className="admin-view-site" href="/" target="_blank" rel="noopener">
						Otwórz stronę ↗
					</a>
					<button
						className="btn btn-outline-secondary btn-sm"
						onClick={handleLogout}
					>
						Wyloguj się
					</button>
				</div>
			</div>

			<div className="admin-main-content">
				<div className="admin-content-header">
					{activeTab === "pages" ? (
						<div className="admin-edit-notice">
							<span>Edytujesz</span>
							<strong>{currentPageData?.name}</strong>
							{currentPageData && (
								<a href={currentPageData.slug} target="_blank" rel="noopener">
									Podgląd {currentPageData.slug} ↗
								</a>
							)}
						</div>
					) : (
						<div className="admin-edit-notice">
							<span>Pliki</span>
							<strong>Biblioteka zdjęć i filmów</strong>
						</div>
					)}
					<div className="admin-actions">
						{activeTab === "pages" && (
							<>
								{saveMessage && (
									<div
										className={`admin-save-message ${
											saveMessage.includes("Błąd")
												? "error"
												: "success"
										}`}
									>
										{saveMessage}
									</div>
								)}
								<button
									className="btn btn-primary"
									onClick={handleSave}
									disabled={isSaving}
								>
									{isSaving
										? "Zapisywanie..."
										: "Zapisz zmiany"}
								</button>
							</>
						)}
					</div>
				</div>

				<div className="admin-content-body">
					{activeTab === "pages" ? (
						<>
							{/* --- SEO --- */}
							<div className="admin-section">
								<h4>SEO</h4>

								<div className="form-group">
									<label>
										Tytuł strony (tag &lt;title&gt;)
									</label>
									<input
										type="text"
										className="form-control"
										value={currentPageData?.seo?.title || ""}
										onChange={(e) =>
											handleInputChange("seo" as any, {
												...(currentPageData?.seo || {
													title: "",
													description: "",
												}),
												title: e.target.value,
											})
										}
										placeholder="np. Fotobudka 360 – OG Events"
									/>
									<small className="form-text text-muted">
										Wyświetla się w zakładce przeglądarki i
										w wynikach Google.
									</small>
								</div>

								<div className="form-group">
									<label>Opis SEO (meta description)</label>
									<textarea
										className="form-control"
										rows={3}
										value={
											currentPageData?.seo?.description ||
											""
										}
										onChange={(e) =>
											handleInputChange("seo" as any, {
												...(currentPageData?.seo || {
													title: "",
													description: "",
												}),
												description: e.target.value,
											})
										}
										placeholder="Krótki opis strony (do ~155 znaków)."
									/>
								</div>
							</div>

							{/* Nawigacja */}
							<div className="admin-section">
								<h4>Nawigacja</h4>
								<div className="form-group">
									<label>Facebook (adres)</label>
									<input
										type="url"
										className="form-control"
										value={
											currentPageData!.navigation
												.facebookUrl
										}
										onChange={(e) =>
											handleInputChange(
												"navigation",
												e.target.value,
												"facebookUrl"
											)
										}
									/>
								</div>
								<div className="form-group">
									<label>Instagram (adres)</label>
									<input
										type="url"
										className="form-control"
										value={
											currentPageData!.navigation
												.instagramUrl
										}
										onChange={(e) =>
											handleInputChange(
												"navigation",
												e.target.value,
												"instagramUrl"
											)
										}
									/>
								</div>
							</div>

							<div className="admin-section">
								<h4>Filmy w polaroidach</h4>
								<div className="admin-video-frames">
									{currentPageData!.videos.map(
										(video, index) => (
											<div
												key={index}
												className="admin-video-frame"
											>
												<div className="form-group">
													<label>Ścieżka filmu</label>
													<input
														type="text"
														className="form-control"
														value={video.src}
														onChange={(e) =>
															handleArrayChange(
																"videos",
																index,
																e.target.value,
																"src"
															)
														}
														placeholder="/assets/main/videos/film.webm"
													/>
												</div>
												<div className="form-group">
													<label>
														Podpis pod filmem
													</label>
													<input
														type="text"
														className="form-control"
														value={video.alt}
														onChange={(e) =>
															handleArrayChange(
																"videos",
																index,
																e.target.value,
																"alt"
															)
														}
														placeholder="Opis filmu"
													/>
												</div>
												<div className="form-group">
													<label>
														Start filmu (sekundy)
													</label>
													<input
														type="number"
														className="form-control"
														value={
															video.startTime || 0
														}
														onChange={(e) =>
															handleArrayChange(
																"videos",
																index,
																parseInt(
																	e.target
																		.value
																) || 0,
																"startTime"
															)
														}
														min="0"
													/>
												</div>
												<button
													className="btn btn-danger btn-sm"
													onClick={() =>
														handleRemoveArrayItem(
															"videos",
															index
														)
													}
												>
													Usuń
												</button>
											</div>
										)
									)}
									<button
										className="btn btn-secondary"
										onClick={() =>
											handleAddArrayItem("videos", {
												src: "",
												alt: "",
												startTime: 0,
											})
										}
									>
										+ Dodaj film
									</button>
								</div>
							</div>

							<div className="admin-section">
								<h4>Sekcja oferty</h4>
								<div className="form-group">
									<label>Napis nad tytułem</label>
									<input
										type="text"
										className="form-control"
										value={
											currentPageData!.welcomeSection
												.welcomeText
										}
										onChange={(e) =>
											handleInputChange(
												"welcomeSection",
												e.target.value,
												"welcomeText"
											)
										}
									/>
								</div>
								<div className="form-group">
									<label>Podtytuł</label>
									<input
										type="text"
										className="form-control"
										value={
											currentPageData!.welcomeSection
												.subtitle
										}
										onChange={(e) =>
											handleInputChange(
												"welcomeSection",
												e.target.value,
												"subtitle"
											)
										}
									/>
								</div>
							</div>

							<div className="admin-section">
								<h4>Liczby (wspólne dla wszystkich stron)</h4>
								<div className="row">
									<div className="col-md-4">
										<input
											className="form-control"
											value={
												currentPageData!.stats
													.clientsCount
											}
											disabled
										/>
									</div>
									<div className="col-md-4">
										<input
											className="form-control"
											value={
												currentPageData!.stats
													.yearsOnMarket
											}
											disabled
										/>
									</div>
									<div className="col-md-4">
										<input
											className="form-control"
											value={
												currentPageData!.stats
													.smilesCount
											}
											disabled
										/>
									</div>
								</div>
							</div>

							<div className="admin-section">
								<h4>Galeria zdjęć</h4>
								<div className="admin-gallery-images">
									{currentPageData!.gallery.images.map(
										(image, index) => (
											<div
												key={index}
												className="admin-gallery-item"
											>
												<div className="form-group">
													<label>Ścieżka zdjęcia</label>
													<input
														type="text"
														className="form-control"
														value={image.src}
														onChange={(e) =>
															handleNestedArrayChange(
																"gallery.images",
																index,
																e.target.value,
																"src"
															)
														}
														placeholder="/assets/main/images/image.jpg"
													/>
												</div>
												<div className="form-group">
													<label>
														Podpis zdjęcia
													</label>
													<input
														type="text"
														className="form-control"
														value={image.alt}
														onChange={(e) =>
															handleNestedArrayChange(
																"gallery.images",
																index,
																e.target.value,
																"alt"
															)
														}
														placeholder="Opis obrazu"
													/>
												</div>
												<button
													className="btn btn-danger btn-sm"
													onClick={() =>
														handleRemoveNestedArrayItem(
															"gallery.images",
															index
														)
													}
												>
													Usuń
												</button>
											</div>
										)
									)}
									<button
										className="btn btn-secondary"
										onClick={() =>
											handleAddNestedArrayItem(
												"gallery.images",
												{ src: "", alt: "" }
											)
										}
									>
										+ Dodaj zdjęcie
									</button>
								</div>
							</div>

							<div className="admin-section">
								<h4>Miasta (sekcja „Gdzie działamy”)</h4>
								<div className="admin-cities">
									{currentPageData!.locations.cities.map(
										(city, index) => (
											<div
												key={index}
												className="admin-city-item"
											>
												<input
													type="text"
													className="form-control"
													value={city}
													onChange={(e) =>
														handleNestedArrayChange(
															"locations.cities",
															index,
															e.target.value
														)
													}
													placeholder="Nazwa miasta"
												/>
												<button
													className="btn btn-danger btn-sm"
													onClick={() =>
														handleRemoveNestedArrayItem(
															"locations.cities",
															index
														)
													}
												>
													Usuń
												</button>
											</div>
										)
									)}
									<button
										className="btn btn-secondary"
										onClick={() =>
											handleAddNestedArrayItem(
												"locations.cities",
												""
											)
										}
									>
										+ Dodaj miasto
									</button>
								</div>
							</div>

							<div className="admin-section">
								<h4>Stopka i kontakt</h4>
								<div className="row">
									<div className="col-md-6">
										<div className="form-group">
											<label>Facebook (URL):</label>
											<input
												type="url"
												className="form-control"
												value={
													currentPageData!.footer
														.facebookUrl
												}
												onChange={(e) =>
													handleInputChange(
														"footer",
														e.target.value,
														"facebookUrl"
													)
												}
											/>
										</div>
										<div className="form-group">
											<label>Facebook (tekst):</label>
											<input
												type="text"
												className="form-control"
												value={
													currentPageData!.footer
														.facebookText
												}
												onChange={(e) =>
													handleInputChange(
														"footer",
														e.target.value,
														"facebookText"
													)
												}
											/>
										</div>
									</div>
									<div className="col-md-6">
										<div className="form-group">
											<label>Instagram (URL):</label>
											<input
												type="url"
												className="form-control"
												value={
													currentPageData!.footer
														.instagramUrl
												}
												onChange={(e) =>
													handleInputChange(
														"footer",
														e.target.value,
														"instagramUrl"
													)
												}
											/>
										</div>
										<div className="form-group">
											<label>Instagram (tekst):</label>
											<input
												type="text"
												className="form-control"
												value={
													currentPageData!.footer
														.instagramText
												}
												onChange={(e) =>
													handleInputChange(
														"footer",
														e.target.value,
														"instagramText"
													)
												}
											/>
										</div>
									</div>
								</div>
								<div className="form-group">
									<label>Numer telefonu</label>
									<input
										type="tel"
										className="form-control"
										value={
											currentPageData!.footer.phoneNumber
										}
										onChange={(e) =>
											handleInputChange(
												"footer",
												e.target.value,
												"phoneNumber"
											)
										}
									/>
								</div>
							</div>
						</>
					) : (
						<>
							<div className="admin-section">
								<h4>Dodaj plik</h4>
								<div className="form-group">
									<label>Dla strony</label>
									<select
										id="mediaType"
										className="form-control"
										style={{
											marginBottom: "15px",
											maxWidth: "200px",
										}}
									>
										<option value="main">Strona główna</option>
										<option value="subpage">Podstrony</option>
									</select>
								</div>
								<div className="form-group">
									<label>Rodzaj</label>
									<select
										id="mediaCategory"
										className="form-control"
										style={{
											marginBottom: "15px",
											maxWidth: "200px",
										}}
									>
										<option value="images">Zdjęcia</option>
										<option value="videos">Filmy</option>
									</select>
								</div>
								<div className="form-group">
									<label>
										Wybierz plik (.webp dla zdjęć, .webm dla
										filmów)
									</label>
									<input
										type="file"
										accept=".webp,.webm"
										onChange={async (e) => {
											const file = e.target.files?.[0];
											if (!file) return;

											// Validate file type
											const isWebp = file.name
												.toLowerCase()
												.endsWith(".webp");
											const isWebm = file.name
												.toLowerCase()
												.endsWith(".webm");

											if (!isWebp && !isWebm) {
												alert(
													"Only .webp (images) and .webm (videos) files are allowed"
												);
												return;
											}

											const mediaTypeSelect =
												document.getElementById(
													"mediaType"
												) as HTMLSelectElement;
											const mediaCategorySelect =
												document.getElementById(
													"mediaCategory"
												) as HTMLSelectElement;

											const mediaType =
												mediaTypeSelect.value;
											const category =
												mediaCategorySelect.value;

											const basePath =
												mediaType === "main"
													? "/assets/main"
													: "/assets/subpages";
											const targetPath = `${basePath}/${category}`;

											try {
												const loadingMsg =
													document.createElement(
														"div"
													);
												loadingMsg.textContent =
													"Uploading file...";
												loadingMsg.style.color = "#666";
												loadingMsg.style.fontSize =
													"14px";
												loadingMsg.style.marginTop =
													"10px";
												e.target.parentElement?.appendChild(
													loadingMsg
												);

												const fullPath =
													await handleFileUpload(
														file,
														targetPath
													);

												const id =
													Date.now().toString(36);

												const item: MediaItem = {
													id,
													name: file.name,
													type: isWebp
														? "image"
														: "video",
													path: fullPath,
													preview: fullPath,
												};

												saveMedia([item, ...media]);

												loadingMsg.remove();
												alert(
													`File uploaded successfully!\nPath: ${fullPath}`
												);

												e.target.value = "";
											} catch (error) {
												const loadingMsg =
													e.target.parentElement?.querySelector(
														"div"
													);
												if (loadingMsg)
													loadingMsg.remove();

												alert(
													"File upload error: " +
														(error as Error).message
												);
											}
										}}
									/>
									<small className="form-text text-muted">
										Akceptowane formaty: .webp (zdjęcia), .webm
										(filmy), do 50 MB
									</small>
								</div>

								<div className="form-group">
									<label>Albo podaj ścieżkę do istniejącego pliku</label>
									<div style={{ display: "flex", gap: 8 }}>
										<input
											id="manualMediaPath"
											type="text"
											className="form-control"
											placeholder="/assets/main/images/plik.webp"
										/>
										<button
											className="btn btn-secondary"
											onClick={() => {
												const input =
													document.getElementById(
														"manualMediaPath"
													) as HTMLInputElement;
												const val = input.value.trim();
												if (!val) return;

												if (
													!val
														.toLowerCase()
														.endsWith(".webp") &&
													!val
														.toLowerCase()
														.endsWith(".webm")
												) {
													alert(
														"Only .webp and .webm files are allowed"
													);
													return;
												}

												const id =
													Date.now().toString(36);
												const isWebp = val
													.toLowerCase()
													.endsWith(".webp");
												const type: MediaItem["type"] =
													isWebp ? "image" : "video";

												const item: MediaItem = {
													id,
													name:
														val.split("/").pop() ||
														val,
													type,
													path: val,
												};
												saveMedia([item, ...media]);
												input.value = "";
											}}
										>
											Dodaj
										</button>
									</div>
									<small className="form-text text-muted">
										Przykład: /assets/main/images/zdjecie.webp
										or /assets/main/videos/video.webm
									</small>
								</div>
							</div>

							<div className="admin-section">
								<h4>Biblioteka plików</h4>
								{media.length === 0 ? (
									<div className="text-muted">
										Brak plików. Dodaj pierwszy powyżej.
									</div>
								) : (
									<div className="row">
										{media.map((m) => (
											<div
												key={m.id}
												className="col-md-6"
												style={{ marginBottom: 15 }}
											>
												<div
													style={{
														border: "1px solid #ddd",
														borderRadius: 8,
														padding: 12,
													}}
												>
													<div
														style={{
															display: "flex",
															gap: 12,
														}}
													>
														<div
															style={{
																width: 96,
																height: 64,
																overflow:
																	"hidden",
																borderRadius: 6,
																background:
																	"#f3f3f3",
															}}
														>
															{m.type ===
																"image" &&
																m.preview && (
																	<img
																		src={
																			m.preview
																		}
																		alt={
																			m.name
																		}
																		style={{
																			width: "100%",
																			height: "100%",
																			objectFit:
																				"cover",
																		}}
																	/>
																)}
															{m.type ===
																"video" &&
																m.preview && (
																	<video
																		src={
																			m.preview
																		}
																		style={{
																			width: "100%",
																			height: "100%",
																			objectFit:
																				"cover",
																		}}
																		muted
																	/>
																)}
															{!m.preview && (
																<div
																	style={{
																		display:
																			"flex",
																		alignItems:
																			"center",
																		justifyContent:
																			"center",
																		height: "100%",
																		color: "#999",
																	}}
																>
																	no preview
																</div>
															)}
														</div>
														<div
															style={{ flex: 1 }}
														>
															<div
																style={{
																	fontWeight: 600,
																}}
															>
																{m.name}
															</div>
															<div
																style={{
																	fontSize: 12,
																	color: "#666",
																	wordBreak:
																		"break-all",
																}}
															>
																{m.path}
															</div>
															<div
																style={{
																	marginTop: 8,
																	display:
																		"flex",
																	gap: 8,
																}}
															>
																<button
																	className="btn btn-secondary btn-sm"
																	onClick={() => {
																		navigator.clipboard.writeText(
																			m.path
																		);
																	}}
																>
																	Kopiuj ścieżkę
																</button>
																<button
																	className="btn btn-danger btn-sm"
																	onClick={() =>
																		saveMedia(
																			media.filter(
																				(
																					x
																				) =>
																					x.id !==
																					m.id
																			)
																		)
																	}
																>
																	Usuń
																</button>
															</div>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								)}

								<div className="admin-section">
									<h4>SEO</h4>
									<div className="form-group">
										<button
											className="btn btn-primary"
											onClick={async () => {
												try {
													const response =
														await fetch(
															"/api/regenerate-sitemap",
															{
																method: "POST",
															}
														);
													if (response.ok) {
														alert(
															"Sitemap regenerated successfully!"
														);
													} else {
														alert(
															"Failed to regenerate sitemap"
														);
													}
												} catch (error) {
													alert(
														"Error regenerating sitemap"
													);
												}
											}}
										>
											Odśwież sitemap.xml
										</button>
									</div>
									<small className="form-text text-muted">
										Po dodaniu lub usunięciu podstrony odśwież
										mapę strony dla Google
									</small>
								</div>

								<small className="text-muted">
									<strong>Jak dodać plik:</strong>
									<br />
									1. Wybierz, dla której strony jest plik i czy to zdjęcie, czy film.
									<br />
									2. Wybierz plik .webp (zdjęcie) albo .webm (film), maksymalnie 50 MB.
									<br />
									3. Plik trafi automatycznie do właściwego folderu na serwerze.
									<br />
									4. Skopiuj ścieżkę z biblioteki i wklej ją w galerii albo w filmach.
								</small>
							</div>
						</>
					)}
				</div>
			</div>

			{showAddPageModal && (
				<div
					className="admin-modal-overlay"
					onClick={() => setShowAddPageModal(false)}
				>
					<div
						className="admin-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="admin-modal-header">
							<h5>Nowa podstrona miasta</h5>
							<button
								className="btn-close"
								onClick={() => setShowAddPageModal(false)}
							>
								×
							</button>
						</div>
						<div className="admin-modal-body">
							<div className="form-group">
								<label>Nazwa (np. Gdańsk)</label>
								<input
									type="text"
									className="form-control"
									value={newPageName}
									onChange={(e) =>
										handlePageNameChange(e.target.value)
									}
									placeholder="np. Warszawa"
								/>
							</div>
							<div className="form-group">
								<label>Adres (np. /gdansk)</label>
								<input
									type="text"
									className="form-control"
									value={newPageSlug}
									onChange={(e) =>
										setNewPageSlug(e.target.value)
									}
									placeholder="warszawa"
								/>
								<small className="form-text text-muted">
									Address will be: /{newPageSlug}
								</small>
							</div>
						</div>
						<div className="admin-modal-footer">
							<button
								className="btn btn-secondary"
								onClick={() => setShowAddPageModal(false)}
							>
								Anuluj
							</button>
							<button
								className="btn btn-primary"
								onClick={handleAddPage}
								disabled={
									!newPageName.trim() ||
									!newPageSlug.trim() ||
									isSaving
								}
							>
								{isSaving ? "Dodawanie..." : "Dodaj stronę"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminPanel;
