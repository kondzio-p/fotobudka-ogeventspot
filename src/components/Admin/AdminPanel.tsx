import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	PageData,
	allPages,
	updatePageData,
	addNewSubPage,
	getPageData,
	removeSubPage,
} from "../../data/pageData";

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
	const [pages, setPages] = useState<PageData[]>(allPages);

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

	const saveMedia = (items: MediaItem[]) => {
		setMedia(items);
		localStorage.setItem("mediaLibrary", JSON.stringify(items));
	};

	const handleFileUpload = async (file: File, targetPath: string): Promise<string> => {
		try {
			// Use FormData for file upload
			const formData = new FormData();
			formData.append('file', file);
			
			// Determine media type and category from targetPath
			const pathParts = targetPath.split('/').filter(part => part);
			const mediaType = pathParts.includes('main') ? 'main' : 'subpages';
			const category = pathParts[pathParts.length - 1]; // 'images' or 'videos'
			
			formData.append('mediaType', mediaType);
			formData.append('category', category);
			
			// Upload file to backend
			const response = await fetch('/api/upload-file', {
				method: 'POST',
				body: formData
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to upload file');
			}
			
			const result = await response.json();
			return result.path;
			
		} catch (error) {
			console.error('Error uploading file:', error);
			throw error;
		}
	};

	useEffect(() => {
		const pageData = getPageData(
			pages.find((p) => p.id === currentPageId)?.slug || "/"
		);
		setCurrentPageData(pageData);
	}, [currentPageId, pages]);

	const handleLogout = () => {
		localStorage.removeItem("adminAuthenticated");
		onLogout();
		navigate("/admin/login");
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

	// ===== Helpers do tablic zagnieżdżonych =====
	const getByPath = (obj: any, path: string) =>
		path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);

	const setByPath = (obj: any, path: string, updater: (ref: any) => void) => {
		const keys = path.split(".");
		const last = keys.pop()!;
		const parent = keys.reduce((acc, key) => (acc[key] ??= {}), obj);
		updater(parent[last]);
	};

	// Top-level array (np. videos)
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

	// Nested array path (np. 'gallery.images' albo 'locations.cities')
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
			await new Promise((resolve) => setTimeout(resolve, 400));
			updatePageData(currentPageData.id, currentPageData);
			setPages([...allPages]);
			setSaveMessage("Zmiany zostały zapisane pomyślnie!");
			setTimeout(() => setSaveMessage(""), 3000);
		} catch {
			setSaveMessage("Błąd podczas zapisywania zmian.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleAddPage = () => {
		if (!newPageName.trim() || !newPageSlug.trim()) return;
		const slug = newPageSlug.startsWith("/")
			? newPageSlug
			: `/${newPageSlug}`;
		const newPage = addNewSubPage(newPageName, slug);
		setPages([...allPages]);
		setNewPageName("");
		setNewPageSlug("");
		setShowAddPageModal(false);
		setCurrentPageId(newPage.id);
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

	if (!currentPageData && activeTab === "pages") {
		return <div className="admin-loading">Ładowanie...</div>;
	}

	return (
		<div className="admin-container">
			<div className="admin-sidebar">
				<div className="admin-sidebar-header">
					<div className="admin-logo">
						<img
							src="/assets/main/images/og-events-logo-black.webp"
							alt="OG Events Logo"
							width="100"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.outerHTML =
									'<div style="color: #8b4b7a; font-weight: bold; font-size: 20px;">OG<br><span style="font-size: 12px; font-weight: normal;">EVENT SPOT</span></div>';
							}}
						/>
					</div>
					<h5>Panel Administracyjny</h5>
				</div>

				<nav className="admin-nav">
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
						Media
					</button>

					{activeTab === "pages" && (
						<>
							{pages.map((page) => (
								<div
									key={page.id}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 8,
										padding: "0 15px",
									}}
								>
									<button
										className={`admin-nav-item ${
											currentPageId === page.id
												? "active"
												: ""
										}`}
										onClick={() =>
											handlePageSelect(page.id)
										}
										style={{ flex: 1 }}
									>
										{page.name}
									</button>
									{page.slug !== "/" && (
										<button
											className="btn btn-danger btn-sm"
											title="Usuń podstronę"
											onClick={() => {
												if (
													confirm(
														`Usunąć podstronę „${page.name}”?`
													)
												) {
													removeSubPage(page.id);
													setPages([...allPages]);
													setCurrentPageId("main");
												}
											}}
										>
											🗑
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
							Aktualnie edytujesz:{" "}
							<strong>{currentPageData?.name}</strong>
						</div>
					) : (
						<div className="admin-edit-notice">
							<strong>Biblioteka mediów</strong>
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
							{/* Nawigacja */}
							<div className="admin-section">
								<h4>Nawigacja</h4>
								<div className="form-group">
									<label>Odnośnik Facebook:</label>
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
									<label>Odnośnik Instagram:</label>
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

							{/* Filmy w głównej galerii (ramki) */}
							<div className="admin-section">
								<h4>Filmy w galerii</h4>
								<div className="admin-video-frames">
									{currentPageData!.videos.map(
										(video, index) => (
											<div
												key={index}
												className="admin-video-frame"
											>
												<div className="form-group">
													<label>
														Ścieżka do filmu:
													</label>
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
													<label>Opis filmu:</label>
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
														Czas startu (sekundy):
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

							{/* Sekcja powitalna */}
							<div className="admin-section">
								<h4>Sekcja powitalna</h4>
								<div className="form-group">
									<label>
										Tekst powitalny (po „Witamy w”):
									</label>
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
									<label>Podtytuł:</label>
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

							{/* Statystyki – (zachowane do odczytu, ale globalne) */}
							<div className="admin-section">
								<h4>Statystyki (globalne – bez edycji)</h4>
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

							{/* Galeria zdjęć (DÓŁ STRONY) */}
							<div className="admin-section">
								<h4>Galeria zdjęć (karuzela)</h4>
								<div className="admin-gallery-images">
									{currentPageData!.gallery.images.map(
										(image, index) => (
											<div
												key={index}
												className="admin-gallery-item"
											>
												<div className="form-group">
													<label>
														Ścieżka do obrazu:
													</label>
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
														Opis obrazu (alt):
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
										+ Dodaj obraz
									</button>
								</div>
							</div>

							{/* Miasta (sekcja „Gdzie działamy?”) */}
							<div className="admin-section">
								<h4>Miasta obsługi</h4>
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

							{/* Stopka */}
							<div className="admin-section">
								<h4>Stopka</h4>
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
									<label>Numer telefonu:</label>
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
							{/* MEDIA LIBRARY */}
							<div className="admin-section">
								<h4>Dodaj media</h4>
								<div className="form-group">
									<label>Wybierz typ mediów:</label>
									<select 
										id="mediaType" 
										className="form-control" 
										style={{ marginBottom: '15px', maxWidth: '200px' }}
									>
										<option value="main">Strona główna</option>
										<option value="subpage">Podstrona</option>
									</select>
								</div>
								<div className="form-group">
									<label>Wybierz kategorię:</label>
									<select 
										id="mediaCategory" 
										className="form-control" 
										style={{ marginBottom: '15px', maxWidth: '200px' }}
									>
										<option value="images">Obrazy</option>
										<option value="videos">Filmy</option>
									</select>
								</div>
								<div className="form-group">
									<label>Wybierz plik (tylko .webp dla obrazów, .webm dla filmów):</label>
									<input
										type="file"
										accept=".webp,.webm"
										onChange={async (e) => {
											const file = e.target.files?.[0];
											if (!file) return;
											
											// Validate file type
											const isWebp = file.name.toLowerCase().endsWith('.webp');
											const isWebm = file.name.toLowerCase().endsWith('.webm');
											
											if (!isWebp && !isWebm) {
												alert('Dozwolone są tylko pliki .webp (obrazy) i .webm (filmy)');
												return;
											}
											
											const mediaTypeSelect = document.getElementById('mediaType') as HTMLSelectElement;
											const mediaCategorySelect = document.getElementById('mediaCategory') as HTMLSelectElement;
											
											const mediaType = mediaTypeSelect.value;
											const category = mediaCategorySelect.value;
											
											// Determine target path
											const basePath = mediaType === 'main' ? '/assets/main' : '/assets/subpages';
											const targetPath = `${basePath}/${category}`;
											
											try {
												// Show loading state
												const loadingMsg = document.createElement('div');
												loadingMsg.textContent = 'Przesyłanie pliku...';
												loadingMsg.style.color = '#666';
												loadingMsg.style.fontSize = '14px';
												loadingMsg.style.marginTop = '10px';
												e.target.parentElement?.appendChild(loadingMsg);
												
												// Upload file to the correct folder
												const fullPath = await handleFileUpload(file, targetPath);
												
												const id = Date.now().toString(36);
												
												const item: MediaItem = {
													id,
													name: file.name,
													type: isWebp ? "image" : "video",
													path: fullPath,
													preview: fullPath // Use the actual path as preview
												};
												
												saveMedia([item, ...media]);
												
												// Remove loading message and show success
												loadingMsg.remove();
												alert(`Plik został przesłany!\nŚcieżka: ${fullPath}`);
												
												// Clear the input
												e.target.value = '';
												
											} catch (error) {
												// Remove loading message if exists
												const loadingMsg = e.target.parentElement?.querySelector('div');
												if (loadingMsg) loadingMsg.remove();
												
												alert('Błąd podczas przesyłania pliku: ' + (error as Error).message);
											}
										}}
									/>
									<small className="form-text text-muted">
										Akceptowane formaty: .webp (obrazy), .webm (filmy)
									</small>
								</div>

								<div className="form-group">
									<label>
										Lub dodaj ścieżkę do istniejącego pliku
									</label>
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
												
												// Validate file extension
												if (!val.toLowerCase().endsWith('.webp') && !val.toLowerCase().endsWith('.webm')) {
													alert('Dozwolone są tylko pliki .webp i .webm');
													return;
												}
												
												const id =
													Date.now().toString(36);
												const isWebp = val.toLowerCase().endsWith('.webp');
												const type: MediaItem["type"] = isWebp ? "image" : "video";
												
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
										Przykład: /assets/main/images/zdjecie.webp lub /assets/main/videos/film.webm
									</small>
								</div>
							</div>

							<div className="admin-section">
								<h4>Twoje media</h4>
								{media.length === 0 ? (
									<div className="text-muted">
										Brak mediów. Dodaj coś powyżej.
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
																	Kopiuj
																	ścieżkę
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
																	Usuń z
																	biblioteki
																</button>
															</div>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
								<small className="text-muted">
									<strong>Automatyczne zapisywanie plików:</strong><br/>
									1. Wybierz typ mediów (główna/podstrona) i kategorię (obrazy/filmy)<br/>
									2. Wybierz plik .webp (obrazy) lub .webm (filmy) - max 50MB<br/>
									3. Plik zostanie automatycznie przesłany do odpowiedniego folderu na serwerze<br/>
									4. Struktura folderów:<br/>
									&nbsp;&nbsp;- <code>/assets/main/images/</code> - obrazy strony głównej<br/>
									&nbsp;&nbsp;- <code>/assets/main/videos/</code> - filmy strony głównej<br/>
									&nbsp;&nbsp;- <code>/assets/subpages/images/</code> - obrazy podstron<br/>
									&nbsp;&nbsp;- <code>/assets/subpages/videos/</code> - filmy podstron<br/>
									5. Skopiuj ścieżkę z biblioteki i użyj w galerii<br/>
									<strong>Uwaga:</strong> Akceptowane tylko pliki .webp i .webm
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
							<h5>Dodaj nową podstronę</h5>
							<button
								className="btn-close"
								onClick={() => setShowAddPageModal(false)}
							>
								×
							</button>
						</div>
						<div className="admin-modal-body">
							<div className="form-group">
								<label>Nazwa strony:</label>
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
								<label>Adres URL (slug):</label>
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
									Adres będzie: /{newPageSlug}
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
									!newPageName.trim() || !newPageSlug.trim()
								}
							>
								Dodaj stronę
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminPanel;
