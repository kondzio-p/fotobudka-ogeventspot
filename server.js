import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Serve SEO files with proper content types
app.get("/robots.txt", (req, res) => {
	res.type("text/plain");
	const robotsPath = path.join(__dirname, "public", "robots.txt");
	if (fs.existsSync(robotsPath)) {
		res.sendFile(robotsPath);
	} else {
		res.status(404).send("robots.txt not found");
	}
});

app.get("/sitemap.xml", (req, res) => {
	res.type("application/xml");
	const sitemapPath = path.join(__dirname, "public", "sitemap.xml");
	if (fs.existsSync(sitemapPath)) {
		res.sendFile(sitemapPath);
	} else {
		res.status(404).send("sitemap.xml not found");
	}
});

const ensureDirectoryExists = (dirPath) => {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
};

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const mediaType = req.body?.mediaType || "main";
		const category = req.body?.category || "images";

		let uploadPath;
		if (mediaType === "main") {
			uploadPath = path.join(
				__dirname,
				"public",
				"assets",
				"main",
				category
			);
		} else {
			uploadPath = path.join(
				__dirname,
				"public",
				"assets",
				"subpages",
				category
			);
		}

		ensureDirectoryExists(uploadPath);

		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	const allowedExtensions = [".webp", ".webm"];
	const fileExtension = path.extname(file.originalname).toLowerCase();

	if (allowedExtensions.includes(fileExtension)) {
		cb(null, true);
	} else {
		cb(new Error("Only .webp and .webm files are allowed"), false);
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 50 * 1024 * 1024,
	},
});

app.post("/api/admin/login", (req, res) => {
	try {
		const { login, password } = req.body;
		const adminLogin = process.env.ADMIN_LOGIN;
		const adminPassword = process.env.ADMIN_PASSWORD;

		if (!adminLogin || !adminPassword) {
			return res.status(500).json({
				success: false,
				message: "Server configuration error",
			});
		}

		if (login === adminLogin && password === adminPassword) {
			res.json({ success: true, message: "Login successful" });
		} else {
			res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
		}
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
		});
	}
});

app.post("/api/upload-file", (req, res) => {
	const uploadHandler = upload.fields([
		{ name: "file", maxCount: 1 },
		{ name: "mediaType", maxCount: 1 },
		{ name: "category", maxCount: 1 },
	]);

	uploadHandler(req, res, (err) => {
		if (err) {
			console.error("Upload error:", err);
			return res.status(400).json({ error: err.message });
		}

		try {
			if (!req.files || !req.files.file || !req.files.file[0]) {
				return res.status(400).json({ error: "No file uploaded" });
			}

			const uploadedFile = req.files.file[0];
			const { mediaType, category } = req.body;

			let publicPath;
			if (mediaType === "main") {
				publicPath = `/assets/main/${category}/${uploadedFile.filename}`;
			} else {
				publicPath = `/assets/subpages/${category}/${uploadedFile.filename}`;
			}

			res.json({
				success: true,
				message: "File uploaded successfully",
				path: publicPath,
				filename: uploadedFile.filename,
				size: uploadedFile.size,
			});
		} catch (error) {
			console.error("Upload error:", error);
			res.status(500).json({ error: "Failed to upload file" });
		}
	});
});

app.post("/api/create-directory", (req, res) => {
	try {
		const { path: dirPath } = req.body;

		if (!dirPath || typeof dirPath !== "string") {
			return res.status(400).json({ error: "Invalid path" });
		}

		if (dirPath.includes("..") || dirPath.includes("~")) {
			return res.status(400).json({ error: "Invalid path" });
		}

		const fullPath = path.join(__dirname, dirPath);

		ensureDirectoryExists(fullPath);

		res.json({
			success: true,
			message: `Directory created: ${dirPath}`,
		});
	} catch (error) {
		console.error("Directory creation error:", error);
		res.status(500).json({ error: "Failed to create directory" });
	}
});

app.get("/api/list-files/:mediaType/:category", (req, res) => {
	try {
		const { mediaType, category } = req.params;

		if (
			!["main", "subpages"].includes(mediaType) ||
			!["images", "videos"].includes(category)
		) {
			return res.status(400).json({ error: "Invalid parameters" });
		}

		let dirPath;
		if (mediaType === "main") {
			dirPath = path.join(
				__dirname,
				"public",
				"assets",
				"main",
				category
			);
		} else {
			dirPath = path.join(
				__dirname,
				"public",
				"assets",
				"subpages",
				category
			);
		}

		if (!fs.existsSync(dirPath)) {
			return res.json({ files: [] });
		}

		const files = fs
			.readdirSync(dirPath)
			.filter((file) => {
				const ext = path.extname(file).toLowerCase();
				return ext === ".webp" || ext === ".webm";
			})
			.map((file) => {
				const filePath = path.join(dirPath, file);
				const stats = fs.statSync(filePath);
				return {
					name: file,
					path: `/assets/${mediaType}/${category}/${file}`,
					size: stats.size,
					modified: stats.mtime,
				};
			});

		res.json({ files });
	} catch (error) {
		console.error("List files error:", error);
		res.status(500).json({ error: "Failed to list files" });
	}
});

app.delete("/api/delete-file", (req, res) => {
	try {
		const { filePath } = req.body;

		if (!filePath || typeof filePath !== "string") {
			return res.status(400).json({ error: "Invalid file path" });
		}

		if (filePath.includes("..") || filePath.includes("~")) {
			return res.status(400).json({ error: "Invalid file path" });
		}

		const fullPath = path.join(__dirname, "public", filePath);

		if (fs.existsSync(fullPath)) {
			fs.unlinkSync(fullPath);
			res.json({ success: true, message: "File deleted successfully" });
		} else {
			res.status(404).json({ error: "File not found" });
		}
	} catch (error) {
		console.error("Delete file error:", error);
		res.status(500).json({ error: "Failed to delete file" });
	}
});

app.get("/api/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Regenerate sitemap endpoint
app.post("/api/regenerate-sitemap", (req, res) => {
	try {
		const sitemapPath = path.join(__dirname, "public", "sitemap.xml");
		const currentDate = new Date().toISOString().split("T")[0];

		// Base cities from default data
		const cities = [
			"chojnice",
			"gdansk",
			"sopot",
			"gdynia",
			"bytow",
			"kartuzy",
			"koscierzyna",
			"slupsk",
			"lebork",
			"ustka",
			"malbork",
			"tczew",
			"wejherowo",
			"puck",
			"hel",
			"starogard-gdanski",
		];

		let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main page -->
  <url>
    <loc>https://fotobudka-ogeventspot.pl/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
`;

		// Add city pages
		cities.forEach((city, index) => {
			const priority = index < 4 ? "0.8" : index < 10 ? "0.7" : "0.6";
			sitemapContent += `  <url>
    <loc>https://fotobudka-ogeventspot.pl/${city}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>
  
`;
		});

		sitemapContent += `</urlset>`;

		fs.writeFileSync(sitemapPath, sitemapContent);

		res.json({
			success: true,
			message: "Sitemap regenerated successfully",
			urls: cities.length + 1,
		});
	} catch (error) {
		console.error("Sitemap regeneration error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to regenerate sitemap",
		});
	}
});

app.use((error, req, res, next) => {
	if (error instanceof multer.MulterError) {
		if (error.code === "LIMIT_FILE_SIZE") {
			return res
				.status(400)
				.json({ error: "File too large. Maximum size is 50MB." });
		}
	}

	if (error.message === "Only .webp and .webm files are allowed") {
		return res.status(400).json({ error: error.message });
	}

	console.error("Server error:", error);
	res.status(500).json({ error: "Internal server error" });
});

app.use((req, res) => {
	const distPath = path.join(__dirname, "dist", "index.html");
	if (fs.existsSync(distPath)) {
		res.sendFile(distPath);
	} else {
		res.status(404).json({
			error: "Application not built. Run 'npm run build' first.",
		});
	}
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Frontend will be served from: http://localhost:${PORT}`);
	console.log(`SEO files available at:`);
	console.log(`  - http://localhost:${PORT}/robots.txt`);
	console.log(`  - http://localhost:${PORT}/sitemap.xml`);

	const requiredDirs = [
		"public/assets/main/images",
		"public/assets/main/videos",
		"public/assets/subpages/images",
		"public/assets/subpages/videos",
	];

	requiredDirs.forEach((dir) => {
		ensureDirectoryExists(path.join(__dirname, dir));
	});

	console.log("Required directories verified");

	// Verify SEO files exist
	const robotsPath = path.join(__dirname, "public", "robots.txt");
	const sitemapPath = path.join(__dirname, "public", "sitemap.xml");

	if (fs.existsSync(robotsPath)) {
		console.log("✓ robots.txt found");
	} else {
		console.log("✗ robots.txt missing");
	}

	if (fs.existsSync(sitemapPath)) {
		console.log("✓ sitemap.xml found");
	} else {
		console.log("✗ sitemap.xml missing");
	}
});
