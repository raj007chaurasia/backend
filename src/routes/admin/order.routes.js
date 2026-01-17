const router = require("express").Router();

const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus, updateOrderPayment, getPendingProductQty, getOrderStatusCounts, getPendingProductOrders, updateOrderItems, getOrderDetails } = require("../../controllers/admin/order.controller");

router.post("/save", placeOrder);
router.get("/", getMyOrders);
router.get("/getall", getAllOrders);
router.get("/details/:id", getOrderDetails);
router.post("/update-status", updateOrderStatus);
router.post("/update-payment", updateOrderPayment);
router.post("/update-items", updateOrderItems);
router.get("/order-product-qty", getPendingProductQty);

router.get("/order-product-orders", getPendingProductOrders);
router.get("/order-status-counts", getOrderStatusCounts);

module.exports = router;
