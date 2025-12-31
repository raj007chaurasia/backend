const express = require("express");
const router = express.Router();

const {
  getBestSellerProducts,
  getCategories,
  getWeights,
  getTags,
  getMinMaxPrice,
  getBrands,
  getFlavours
} = require("../../controllers/user/product.controller");

router.get("/best-sellers", getBestSellerProducts);
router.get("/categories", getCategories);
router.get("/weights", getWeights);
router.get("/tags", getTags);
router.get("/min-max-price", getMinMaxPrice);
router.get("/brands", getBrands);
router.get("/flavours", getFlavours);

module.exports = router;