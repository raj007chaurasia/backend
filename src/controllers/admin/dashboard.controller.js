const { Order, OrderItem, Category, Product, User, Brand, ProductImage } = require("../../models");
const Sequelize = require("../../config/db");

/**
 * DASHBOARD SUMMARY COUNTS
 */
exports.getDashboardCounts = async (req, res) => {
  try {
    const [ totalOrders, totalCategories, totalProducts, totalCustomers ] = await Promise.all([ Order.count(), Category.count(), Product.count(), User.count() ]);

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalCategories,
        totalProducts,
        totalCustomers
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * TOP 5 BEST SELLING PRODUCTS
 */
exports.getTopSellingProducts = async (req, res) => {
  try {
    const products = await OrderItem.findAll({
      attributes: [
        "ItemId",
        [Sequelize.fn("COUNT", Sequelize.col("OrderItem.id")), "orderCount"]
      ],
      group: ["ItemId"],
      order: [[Sequelize.literal("orderCount"), "DESC"]],
      limit: 5,
      include: [
        {
          model: Product,
          attributes: ["id", "name"],
          include: [
            { model: Brand, attributes: ["brand"] },
            {
              model: ProductImage,
              attributes: ["path"],
              limit: 1
            }
          ]
        }
      ]
    });

    const data = products.map(p => ({
      productName: p.Product.name,
      brand: p.Product.Brand?.brand || null,
      image: p.Product.ProductImages?.[0]?.path || null,
      totalOrders: parseInt(p.get("orderCount"))
    }));

    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * TOP 6 CUSTOMERS BY ORDER AMOUNT
 */
exports.getTopCustomers = async (req, res) => {
  try {
    const customers = await Order.findAll({
      attributes: [
        "CustomerId",
        [Sequelize.fn("COUNT", Sequelize.col("Order.id")), "orderCount"],
        [Sequelize.fn("SUM", Sequelize.col("Amount")), "totalAmount"]
      ],
      group: ["CustomerId"],
      order: [[Sequelize.literal("totalAmount"), "DESC"]],
      limit: 6,
      include: [
        {
          model: User,
          attributes: ["name", "mobile"]
        }
      ]
    });

    const data = customers.map(c => ({
      customerName: c.User.name,
      phone: c.User.mobile,
      orderCounts: parseInt(c.get("orderCount")),
      orderAmount: parseFloat(c.get("totalAmount"))
    }));

    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};