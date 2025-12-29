const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  saveProduct,
  deleteProduct,
  changeStatusProduct,
  setBestSellerProduct
} = require("../../controllers/admin/product.controller");

// ADMIN PRODUCT ROUTES
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/save", saveProduct);
router.delete("/:id", deleteProduct);
router.post("/changeStatus", changeStatusProduct);
router.post("/setBestSeller", setBestSellerProduct);

module.exports = router;
