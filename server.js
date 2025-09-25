import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Ensure directories exist
const ensureDirectoryExists = (dirPath) => {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
};

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// Default values in case req.body is not yet parsed
		const mediaType = req.body?.mediaType || 'main';
		const category = req.body?.category || 'images';

		// Determine the upload path
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

		// Ensure directory exists
		ensureDirectoryExists(uploadPath);

		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		// Keep original filename
		cb(null, file.originalname);
	},
});

// File filter - only allow .webp and .webm files
const fileFilter = (req, file, cb) => {
	const allowedExtensions = [".webp", ".webm"];
	const fileExtension = path.extname(file.originalname).toLowerCase();

	if (allowedExtensions.includes(fileExtension)) {
		cb(null, true);
	} else {
		cb(new Error("Only .webp and .webm files are allowed"), false);
	}
};

// Create multer instance with fields parsing first
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 50 * 1024 * 1024, // 50MB limit
	},
});

// API Routes

// Admin login endpoint
app.post("/api/admin/login", (req, res) => {
	try {
		const { login, password } = req.body;
		const adminLogin = process.env.ADMIN_LOGIN || 'fotobudka';
		const adminPassword = process.env.ADMIN_PASSWORD || 'f0t0budk4!';

		if (login === adminLogin && password === adminPassword) {
			res.json({ success: true, message: 'Zalogowano pomyślnie' });
		} else {
			res.status(401).json({ success: false, message: 'Nieprawidłowy login lub hasło' });
		}
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ success: false, message: 'Błąd serwera' });
	}
});

// Upload file endpoint
app.post("/api/upload-file", (req, res) => {
	// Use multer with fields parsing
	const uploadHandler = upload.fields([
		{ name: 'file', maxCount: 1 },
		{ name: 'mediaType', maxCount: 1 },
		{ name: 'category', maxCount: 1 }
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

			// Generate the public path for the uploaded file
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

// Create directory endpoint
app.post("/api/create-directory", (req, res) => {
	try {
		const { path: dirPath } = req.body;
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

// List files in directory
app.get("/api/list-files/:mediaType/:category", (req, res) => {
	try {
		const { mediaType, category } = req.params;

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

// Delete file endpoint
app.delete("/api/delete-file", (req, res) => {
	try {
		const { filePath } = req.body;
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

// Health check
app.get("/api/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
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

// Serve React app for all other routes (catch-all route)
// This must be the LAST route defined
app.use((req, res) => {
	// Check if dist directory exists
	const distPath = path.join(__dirname, "dist", "index.html");
	if (fs.existsSync(distPath)) {
		res.sendFile(distPath);
	} else {
		res.status(404).json({ 
			error: "Application not built. Run 'npm run build' first." 
		});
	}
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Frontend will be served from: http://localhost:${PORT}`);

	// Ensure required directories exist
	const requiredDirs = [
		"public/assets/main/images",
		"public/assets/main/videos",
		"public/assets/subpages/images",
		"public/assets/subpages/videos",
	];

	requiredDirs.forEach((dir) => {
		ensureDirectoryExists(path.join(__dirname, dir));
	});

	console.log("Required directories created/verified");
});