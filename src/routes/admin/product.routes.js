const express = require("express");
const router = express.Router();

const upload = require("../../config/multer");

const {
  getAllProducts,
  getProductById,
  saveProduct,
  deleteProduct,
  changeStatusProduct,
  updateProductActiveStatus,
  setBestSellerProduct,
  getLowStockProducts,
  updateProductStock
} = require("../../controllers/admin/product.controller");

// ADMIN PRODUCT ROUTES
router.post("/save", upload.array("images", 10), saveProduct);
router.post("/changeStatus", changeStatusProduct);
router.post("/setBestSeller", setBestSellerProduct);
router.get("/low-stock", getLowStockProducts);
router.patch("/:id/stock", updateProductStock);
router.patch("/:id/status", updateProductActiveStatus);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);
router.get("/", getAllProducts);

module.exports = router;
