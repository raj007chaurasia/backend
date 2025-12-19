const express = require("express");
const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  saveCategory,
  deleteCategory
} = require("../controllers/category.controller");

// ADMIN CATEGORY ROUTES
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/save", saveCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
