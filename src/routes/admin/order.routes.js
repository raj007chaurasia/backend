const router = require("express").Router();

const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus } = require("../../controllers/admin/order.controller");

router.post("/save", placeOrder);
router.get("/", getMyOrders);
router.get("/getall", getAllOrders);
router.post("/update-status", updateOrderStatus);

module.exports = router;
