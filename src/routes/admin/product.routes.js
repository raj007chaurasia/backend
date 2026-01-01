const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  saveProduct,
  deleteProduct,
  changeStatusProduct,
  setBestSellerProduct,
  getLowStockProducts,
  updateProductStock
} = require("../../controllers/admin/product.controller");

// ADMIN PRODUCT ROUTES
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/save", saveProduct);
router.delete("/:id", deleteProduct);
router.post("/changeStatus", changeStatusProduct);
router.post("/setBestSeller", setBestSellerProduct);
router.get("/low-stock", getLowStockProducts);
router.patch("/:id/stock", updateProductStock);

module.exports = router;
