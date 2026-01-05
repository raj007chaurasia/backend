const {
  Order,
  OrderItem,
  Product,
  User
} = require("../models");

const { Op } = require("sequelize");

exports.createOrder = async ({ customerId, items, transactionId }) => {
  let totalAmount = 0;

  // Calculate total
  for (const item of items) {
    totalAmount += item.price * item.qty;
  }

  const order = await Order.create({
    OrderNo: `${Date.now()}`,
    OrderDate: new Date(),
    CustomerId: customerId,
    Amount: totalAmount,
    eOrderStatus: 1,
    TransactionId: transactionId || null
  });

  const orderItems = items.map(i => ({
    OrderId: order.id,
    ItemId: i.productId,
    Qty: i.qty,
    Price: i.price,
    IsActive: true
  }));

  await OrderItem.bulkCreate(orderItems);

  return order;
};

exports.getOrdersByCustomer = async (customerId) => {
  return Order.findAll({
    where: { CustomerId: customerId },
    include: [{ model: OrderItem }],
    order: [["OrderDate", "DESC"]]
  });
};

exports.getAdminOrders = async ({ page, limit, search }) => {
  const offset = (page - 1) * limit;

  const where = {};

  if (search) {
    where[Op.or] = [
      { OrderNo: { [Op.like]: `%${search}%` } }
    ];
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [
      { model: User, attributes: ["id", "name"] },
      { model: OrderItem, include: [Product] }
    ],
    limit,
    offset,
    order: [["OrderDate", "DESC"]],
    distinct: true
  });

  return { rows, count };
};
