export const prerender = false; // <--- WAŻNE

import fs from "node:fs";
import path from "node:path";

export const GET = async ({ request }) => {
	const url = new URL(request.url);
	const folder = url.searchParams.get("folder") || "gallery";

	const dirPath = path.join(process.cwd(), "public", "media", folder);

	if (!fs.existsSync(dirPath)) {
		return new Response(JSON.stringify([]), { status: 200 });
	}

	try {
		const files = fs.readdirSync(dirPath).map((file) => {
			return {
				name: file,
				url: `/media/${folder}/${file}`,
			};
		});

		files.sort((a, b) => b.name.localeCompare(a.name));

		return new Response(JSON.stringify(files), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
		});
	}
};

export const DELETE = async ({ request }) => {
	try {
		const { folder, name } = await request.json();

		const safeName = path.basename(name);
		const safeFolder = folder === "videos" ? "videos" : "gallery";

		const filePath = path.join(
			process.cwd(),
			"public",
			"media",
			safeFolder,
			safeName
		);

		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			return new Response(JSON.stringify({ success: true }), {
				status: 200,
			});
		} else {
			return new Response(
				JSON.stringify({ error: "Plik nie istnieje" }),
				{ status: 404 }
			);
		}
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
		});
	}
};
