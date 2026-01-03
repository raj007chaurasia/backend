const orderService = require("../../services/order.service");
const { Order, OrderItem, Product, Brand } = require("../../models");
const { Orders } = require("../../config/permission");
const { Op, fn, col, literal } = require("sequelize");

/**
 * GET ALL ORDERS (ADMIN)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Orders))
      return res.status(400).json({ success: false, message: "you don't have permission to get list of orders." });

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
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Orders))
      return res.status(400).json({ success: false, message: "you don't have permission to update order." });

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
    const jwt = extractToken(req);
    if(jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if(!Token.id)
      return res.status(400).json({success: false, message: "Invalid User Token."});

    const customerId = Token.id;
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
    const jwt = extractToken(req);
    if(jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if(!Token.id)
      return res.status(400).json({success: false, message: "Invalid User Token."});

    const customerId = Token.id;

    const orders = await orderService.getOrdersByCustomer(customerId);

    return res.status(200).json({ success: true, data: orders });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Product-wise pending (not packed) order qty
 */
exports.getPendingProductQty = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Orders))
      return res.status(400).json({ success: false, message: "you don't have permission to get list of pending orders." });

    const data = await OrderItem.findAll({
      where: {
        isPacked: false
      },
      attributes: [
        "productId",
        [fn("SUM", col("qty")), "remainingQty"],
        [fn("COUNT", fn("DISTINCT", col("orderId"))), "totalOrders"]
      ],
      include: [
        {
          model: Product,
          attributes: ["name", "weight"],
          include: [
            {
              model: Brand,
              attributes: ["name"]
            }
          ]
        }
      ],
      group: [
        "OrderItem.productId",
        "Product.id",
        "Product->Brand.id"
      ],
      order: [[literal("remainingQty"), "DESC"]]
    });

    const response = data.map(item => ({
      productName: item.Product.name,
      brandName: item.Product.Brand?.name || null,
      weight: item.Product.weight,
      remainingQty: Number(item.get("remainingQty")),
      totalOrders: Number(item.get("totalOrders"))
    }));

    return res.status(200).json({ success: true, count: response.length, data: response });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch pending packed products" });
  }
};

exports.getOrderStatusCounts = async (req, res) => {
  try {
    const results = await Order.findAll({
      attributes: [
        "eOrderStatus",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]
      ],
      group: ["eOrderStatus"]
    });

    // Default response structure (all statuses)
    const response = {
      pending: 0,
      confirmed: 0,
      packaging: 0,
      outForDelivery: 0,
      partiallyDelivered: 0,
      delivered: 0
    };

    // Map DB result to response
    results.forEach(r => {
      const status = r.eOrderStatus;
      const count = parseInt(r.get("count"));

      switch (status) {
        case 1:
          response.pending = count;
          break;
        case 2:
          response.confirmed = count;
          break;
        case 3:
          response.packaging = count;
          break;
        case 4:
          response.outForDelivery = count;
          break;
        case 5:
          response.partiallyDelivered = count;
          break;
        case 6:
          response.delivered = count;
          break;
      }
    });

    return res.status(200).json({ success: true, data: response });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};