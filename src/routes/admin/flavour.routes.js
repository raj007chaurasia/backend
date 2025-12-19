const express = require("express");
const router = express.Router();

const {
  getAllFlavours,
  getFlavourById,
  saveFlavour,
  deleteFlavour
} = require("../controllers/flavour.controller");

// ADMIN FLAVOUR ROUTES
router.get("/", getAllFlavours);
router.get("/:id", getFlavourById);
router.post("/save", saveFlavour);
router.delete("/:id", deleteFlavour);

module.exports = router;
