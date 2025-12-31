const express = require("express");
const router = express.Router();

const {
  saveAddress,
  getAllAddresses,
  getAddressById
} = require("../../controllers/user/user.controller");

router.post("/address/save", saveAddress);
router.get("/address/", getAllAddresses);
router.get("/address/:id", getAddressById);

module.exports = router;
