const orderService = require("../../services/order.service");
const { Order } = require("../../models");

/**
 * GET ALL ORDERS (ADMIN)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const { rows, count } = await orderService.getAdminOrders({ page, limit, search });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        limit
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE ORDER STATUS (ADMIN)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findByPk(orderId);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    order.eOrderStatus = status;
    await order.save();

    return res.status(200).json({ success: true, message: "Order status updated successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PLACE ORDER (USER)
 */
exports.placeOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { items, transactionId } = req.body;

    if (!items || !items.length)
      return res.status(400).json({ success: false, message: "Order items are required" });

    const order = await orderService.createOrder({ customerId, items, transactionId });

    return res.status(201).json({ success: true, message: "Order placed successfully", orderId: order.id, orderNo: order.OrderNo });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET USER ORDERS
 */
exports.getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.id;

    const orders = await orderService.getOrdersByCustomer(customerId);

    return res.status(200).json({ success: true, data: orders });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
