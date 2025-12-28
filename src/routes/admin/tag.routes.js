const express = require("express");
const router = express.Router();

const {
  getAllTags,
  getTagById,
  saveTag,
  deleteTag
} = require("../../controllers/admin/tag.controller");

// ADMIN TAG ROUTES
router.get("/", getAllTags);
router.get("/:id", getTagById);
router.post("/save", saveTag);
router.delete("/:id", deleteTag);

module.exports = router;
