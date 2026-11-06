// "Starogard Gdański" -> "starogard-gdanski"
export const slugify = (str: string) =>
	str
		.toLowerCase()
		.replace(/ł/g, "l")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
