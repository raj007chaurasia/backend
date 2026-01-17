const orderService = require("../../services/order.service");
const Sequelize = require("../../config/db");
const { Order, OrderItem, Product, Brand, User } = require("../../models");
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
 * GET SINGLE ORDER DETAILS
 */
exports.getOrderDetails = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    // Permission check? 
    // Both Admin and Customer can view details, but Customer only their own.
    const Token = jwt.Token;
    const { id } = req.params;

    if (!id) return res.status(400).json({ success: false, message: "Order ID required" });

    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Access Control
    const isAdmin = Token.permissions.includes(Orders); // Or check role
    const isOwner = Number(order.CustomerId) === Number(Token.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this order." });
    }

    return res.status(200).json({ success: true, data: order });

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
    // Include status 5 (Partially Delivered) to track remaining items
    const data = await OrderItem.findAll({
      where: {
        IsActive: true
      },
      attributes: [
        "ItemId",
        [fn("SUM", literal("OrderItem.Qty - COALESCE(OrderItem.DeliveredQty, 0)")), "remainingQty"],
        [fn("SUM", col("OrderItem.Qty")), "totalQty"],
        [fn("COUNT", fn("DISTINCT", col("OrderItem.OrderId"))), "totalOrders"]
      ],
      include: [
        {
          model: Order,
          attributes: [],
          required: true,
          where: {
            eOrderStatus: { [Op.in]: [1, 2, 3, 5] }
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
      productId: item.Product?.id ?? item.ItemId,
      productName: item.Product?.name ?? null,
      brandName: item.Product?.Brand?.brand ?? null,
      weight: item.Product?.Weight ?? null,
      unitPrice: item.Product?.Price ?? null,
      remainingQty: Number(item.get("remainingQty")),
      totalQty: Number(item.get("totalQty")),
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

/**
 * Get pending orders list for a specific product
 */
exports.getPendingProductOrders = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Orders))
      return res.status(400).json({ success: false, message: "Permission denied." });

    const { productId } = req.query;

    if (!productId)
      return res.status(400).json({ success: false, message: "Product ID is required." });

    const data = await OrderItem.findAll({
      where: {
        ItemId: productId,
        IsActive: true
      },
      include: [
        {
          model: Order,
          required: true,
          where: {
            // Pending, Confirmed, Packaging, Partially Delivered
            eOrderStatus: { [Op.in]: [1, 2, 3, 5] }
          },
          include: [
            {
              model: User,
              attributes: ["name", "mobile"]
            }
          ]
        },
        {
          model: Product,
          attributes: ["id", "name"]
        }
      ],
      order: [[col("Order.OrderDate"), "ASC"]]
    });

    const list = data.map(item => ({
      orderItemId: item.id,
      status: item.eStatus,
      deliveredQty: item.DeliveredQty,
      orderId: item.Order ? (item.Order.OrderNo || item.Order.id) : "-",
      orderDbId: item.Order?.id,
      customerName: item.Order?.User?.name || "Guest",
      customerPhone: item.Order?.User?.mobile || "—",
      qty: item.Qty,
      date: item.Order?.OrderDate
    }));

    return res.status(200).json({ success: true, data: list });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE ORDER ITEMS (ADMIN)
 * Update status and delivered quantity per item.
 */
exports.updateOrderItems = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true) return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Orders))
      return res.status(400).json({ success: false, message: "Permission denied." });

    const { orderId, items } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: "Order ID is required" });

    const order = await Order.findByPk(orderId, { include: [OrderItem] });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (Array.isArray(items)) {
      for (const u of items) {
        const item = order.OrderItems.find((oi) => oi.id === u.id);
        if (item) {
          if (u.deliveredQty !== undefined) item.DeliveredQty = u.deliveredQty;
          if (u.status !== undefined) item.eStatus = u.status;
          
          // Auto-infer status if deliveredQty is set but status isn't (or both)
          if (u.deliveredQty !== undefined) {
             const dQty = Number(u.deliveredQty);
             const oQty = Number(item.Qty);
             if (dQty >= oQty) item.eStatus = 6;
             else if (dQty > 0) item.eStatus = 5;
             // Else if 0, keep as is or set to Pending/Confirmed? Keeping as is is safer.
          }
          await item.save();
        }
      }
    }

    await order.reload();

    // Recalculate Order Status
    const itemStatuses = order.OrderItems.map((i) => Number(i.eStatus));
    const all6 = itemStatuses.every((s) => s === 6);
    const hasPartial = itemStatuses.some((s) => s === 5);
    const hasDelivered = itemStatuses.some((s) => s === 6);
    
    let nextStatus = order.eOrderStatus;

    if (all6) {
      nextStatus = 6; // Delivered
    } else if (hasPartial || (hasDelivered && !all6)) {
      nextStatus = 5; // Partially Delivered
    } else {
      // Majority Logic
      const counts = {};
      itemStatuses.forEach((s) => { counts[s] = (counts[s] || 0) + 1; });
      let maxFreq = 0;
      let majStatus = nextStatus;
      for (const [s, c] of Object.entries(counts)) {
        if (c > maxFreq) {
          maxFreq = c;
          majStatus = Number(s);
        }
      }
      nextStatus = majStatus;
    }

    if (order.eOrderStatus !== nextStatus) {
      order.eOrderStatus = nextStatus;
      await order.save();
    }

    return res.status(200).json({ success: true, message: "Order items updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

