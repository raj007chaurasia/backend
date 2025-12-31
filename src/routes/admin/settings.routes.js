const express = require("express");
const router = express.Router();

const {
  saveGeneralSettings,
  getGeneralSettings
} = require("../../controllers/admin/settings.controller");

// later you can add admin auth middleware
router.post("/", saveGeneralSettings);
router.get("/", getGeneralSettings);

module.exports = router;
