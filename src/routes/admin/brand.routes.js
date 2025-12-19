const express = require("express");
const router = express.Router();

const {
  getAllBrands,
  getBrandById,
  saveBrand,
  deleteBrand
} = require("../controllers/brand.controller");

// ADMIN BRAND ROUTES
router.get("/", getAllBrands);
router.get("/:id", getBrandById);
router.post("/save", saveBrand);
router.delete("/:id", deleteBrand);

module.exports = router;
