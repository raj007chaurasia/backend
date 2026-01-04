const express = require("express");
const router = express.Router();

const uploadSettingsLogo = require("../../config/multer.settingsLogo");

const {
  saveGeneralSettings,
  getGeneralSettings
} = require("../../controllers/admin/settings.controller");

// later you can add admin auth middleware
// Supports:
// - JSON body (no file)
// - multipart/form-data (optional file field: logo)
router.post("/", uploadSettingsLogo.single("logo"), saveGeneralSettings);
router.get("/", getGeneralSettings);

module.exports = router;
