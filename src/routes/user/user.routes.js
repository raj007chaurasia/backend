const express = require("express");
const router = express.Router();

const {
  saveAddress,
  getAllAddresses,
  getAddressById,
  changePassword,
  getMe,
  updateUserDetails
} = require("../../controllers/user/user.controller");

router.post("/address/save", saveAddress);
router.get("/address/", getAllAddresses);
router.get("/address/:id", getAddressById);
router.post("/change_password", changePassword);
router.get("/me", getMe);
router.post("/save", updateUserDetails);

module.exports = router;
