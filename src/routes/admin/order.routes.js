const router = require("express").Router();

const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus, updateOrderPayment, getPendingProductQty, getOrderStatusCounts } = require("../../controllers/admin/order.controller");

router.post("/save", placeOrder);
router.get("/", getMyOrders);
router.get("/getall", getAllOrders);
router.post("/update-status", updateOrderStatus);
router.post("/update-payment", updateOrderPayment);
router.get("/order-product-qty", getPendingProductQty);
router.get("/order-status-counts", getOrderStatusCounts);

module.exports = router;
