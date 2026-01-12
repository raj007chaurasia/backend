const express = require("express");
const router = express.Router();
const controller = require("../controllers/contact.controller");

// Public route to submit form
router.post("/", controller.createContact);

// Admin routes (should be protected in real app, but for now open as per existing pattern or user request)
router.get("/", controller.getAllContacts);
router.delete("/:id", controller.deleteContact);

module.exports = router;
