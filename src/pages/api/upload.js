export const prerender = false; // <--- WAŻNE: To włącza tryb serwerowy dla tego pliku

import fs from "node:fs";
import path from "node:path";

export const POST = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get("file");
		const folder = formData.get("folder") || "gallery";

		if (!file || !file.name) {
			return new Response(JSON.stringify({ error: "Brak pliku" }), {
				status: 400,
			});
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Bezpieczna nazwa
		const safeName =
			Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

		// Ścieżka: public/media/[folder]/
		const uploadDir = path.join(process.cwd(), "public", "media", folder);

		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}

		const filePath = path.join(uploadDir, safeName);
		fs.writeFileSync(filePath, buffer);

		return new Response(
			JSON.stringify({
				url: `/media/${folder}/${safeName}`,
				name: safeName,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
		});
	}
};
