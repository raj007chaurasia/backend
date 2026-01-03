const fs = require("fs");
const path = require("path");
const multer = require("multer");

const productsUploadDir = path.join(__dirname, "..", "uploads", "products");
fs.mkdirSync(productsUploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, productsUploadDir);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname || "").toLowerCase();
		const safeExt = ext && ext.length <= 10 ? ext : "";
		const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
		cb(null, uniqueName);
	}
});

const fileFilter = (req, file, cb) => {
	if (file && typeof file.mimetype === "string" && file.mimetype.startsWith("image/")) {
		return cb(null, true);
	}

	return cb(new Error("Only image files are allowed"));
};

module.exports = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024
	}
});
