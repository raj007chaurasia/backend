const express = require("express");
const router = express.Router();

const upload = require("../../config/multer");

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
router.post("/save", upload.array("images", 10), saveProduct);
router.delete("/:id", deleteProduct);
router.post("/changeStatus", changeStatusProduct);
router.post("/setBestSeller", setBestSellerProduct);

module.exports = router;
