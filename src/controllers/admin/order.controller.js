const orderService = require("../../services/order.service");
const Sequelize = require("../../config/db");
const { Order, OrderItem, Product, Brand } = require("../../models");
const { Orders } = require("../../config/permission");
const { Op, fn, col, literal } = require("sequelize");
const { extractToken } = require("../../config/jwt");

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
 * UPDATE ORDER PAYMENT (ADMIN)
 * Allows admin to mark paid/unpaid/partially paid.
 */
exports.updateOrderPayment = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Orders))
      return res.status(400).json({ success: false, message: "you don't have permission to update order payment." });

    const { orderId, paymentStatus, paidAmount, transactionId } = req.body;

    if (!orderId)
      return res.status(400).json({ success: false, message: "orderId is required" });

    const order = await Order.findByPk(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    if (req.body?.amount !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Order Amount updates are not supported from this endpoint"
      });
    }

    const status = String(paymentStatus ?? "").trim();
    if (!["Unpaid", "Partially Paid", "Paid"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "paymentStatus must be one of: Unpaid, Partially Paid, Paid"
      });
    }

    const totalAmount = Number(order.Amount ?? 0) || 0;
    const currentPaid = Number(order.PaidAmount ?? 0) || 0;

    let nextPaid = currentPaid;
    let nextPaymentCode = order.ePaymentStatus ?? 0;

    if (status === "Unpaid") {
      nextPaid = 0;
      nextPaymentCode = 0;
    } else if (status === "Paid") {
      nextPaid = totalAmount;
      nextPaymentCode = 2;
    } else if (status === "Partially Paid") {
      const delta = Number(paidAmount);
      if (!Number.isFinite(delta) || delta <= 0) {
        return res.status(400).json({ success: false, message: "paidAmount must be a positive number for Partially Paid" });
      }
      nextPaid = Math.min(totalAmount, currentPaid + delta);
      nextPaymentCode = nextPaid >= totalAmount ? 2 : 1;
    }

    // Clamp if total amount changed
    if (nextPaid > totalAmount) nextPaid = totalAmount;

    order.PaidAmount = nextPaid;
    order.ePaymentStatus = nextPaymentCode;

    if (nextPaid > 0) {
      const tx = String(transactionId ?? "").trim();
      if (tx) {
        order.TransactionId = tx;
      } else if (!order.TransactionId) {
        order.TransactionId = `MANUAL-${Date.now()}`;
      }
    } else {
      order.TransactionId = null;
    }

    await order.save();

    const remainingAmount = Math.max(0, (Number(order.Amount ?? 0) || 0) - (Number(order.PaidAmount ?? 0) || 0));
    const paymentStatusText = order.ePaymentStatus === 2 ? "Paid" : order.ePaymentStatus === 1 ? "Partially Paid" : "Unpaid";

    return res.status(200).json({
      success: true,
      message: "Order payment updated successfully",
      data: {
        id: order.id,
        Amount: order.Amount,
        PaidAmount: order.PaidAmount,
        RemainingAmount: remainingAmount,
        paymentStatus: paymentStatusText,
        TransactionId: order.TransactionId,
        paid: Boolean(order.TransactionId)
      }
    });

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
    const { items, transactionId, addressId } = req.body;

    if (!items || !items.length)
      return res.status(400).json({ success: false, message: "Order items are required" });

    if (!addressId)
      return res.status(400).json({ success: false, message: "Address is required" });

    const order = await orderService.createOrder({ customerId, items, transactionId, addressId });

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

    // Note: OrderItem model does not have `isPacked`. We treat "pending to pack" as
    // items belonging to active order-items in orders that are not yet delivered.
    // Adjust these statuses if your business rules differ.
    const data = await OrderItem.findAll({
      where: {
        IsActive: true
      },
      attributes: [
        "ItemId",
        [fn("SUM", col("OrderItem.Qty")), "remainingQty"],
        [fn("COUNT", fn("DISTINCT", col("OrderItem.OrderId"))), "totalOrders"]
      ],
      include: [
        {
          model: Order,
          attributes: [],
          required: true,
          where: {
            eOrderStatus: { [Op.in]: [1, 2, 3] }
          }
        },
        {
          model: Product,
          attributes: ["id", "name", "Weight", "Price"],
          include: [
            {
              model: Brand,
              attributes: ["id", "brand"],
              required: false
            }
          ]
        }
      ],
      group: [
        "OrderItem.ItemId",
        "Product.id",
        "Product.name",
        "Product.Weight",
        "Product.Price",
        "Product->Brand.id",
        "Product->Brand.brand"
      ],
      order: [[literal("remainingQty"), "DESC"]]
    });

    const response = data.map(item => ({
      productName: item.Product?.name ?? null,
      brandName: item.Product?.Brand?.brand ?? null,
      weight: item.Product?.Weight ?? null,
      unitPrice: item.Product?.Price ?? null,
      remainingQty: Number(item.get("remainingQty")),
      totalOrders: Number(item.get("totalOrders"))
    }));

    return res.status(200).json({ success: true, count: response.length, data: response });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch pending packed products" });
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