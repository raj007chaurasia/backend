const express = require("express");
const router = express.Router();

const { getProducts, getProductDetails } = require("../../controllers/user/frontend.controller");

// CUSTOMER PRODUCT LIST (NO AUTH)
router.get("/", getProducts);

// PRODUCT DETAILS
router.get("/product-details", getProductDetails);

module.exports = router;
