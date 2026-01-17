const {
  Order,
  OrderItem,
  Product,
  ProductImage,
  CustomerAddress,
  User
} = require("../models");

const { Op } = require("sequelize");

exports.createOrder = async ({ customerId, items, transactionId, addressId }) => {
  let totalAmount = 0;

  // Calculate total
  for (const item of items) {
    // Frontend sends line-total price per item: { productId, qty, price }
    totalAmount += Number(item.price) || 0;
  }

  const order = await Order.create({
    OrderNo: `${Date.now()}`,
    OrderDate: new Date(),
    CustomerId: customerId,
    Amount: totalAmount,
    PaidAmount: 0,
    ePaymentStatus: transactionId ? 2 : 0,
    eOrderStatus: 1,
    TransactionId: transactionId || null,
    AddressId: addressId
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
    include: [
      {
        model: CustomerAddress,
        required: false
      },
      {
        model: OrderItem,
        include: [
          {
            model: Product,
            attributes: ["id", "name", "Price", "PacketsPerJar"],
            include: [
              {
                model: ProductImage,
                attributes: ["Path"],
                limit: 1,
                separate: true
              }
            ]
          }
        ]
      }
    ],
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
      { model: User, attributes: ["id", "name", "mobile"] },
      { model: OrderItem, include: [Product] }
    ],
    limit,
    offset,
    order: [["OrderDate", "DESC"]],
    distinct: true
  });

  return { rows, count };
};

exports.getOrderById = async (id) => {
  return Order.findByPk(id, {
    include: [
      {
        model: CustomerAddress,
        required: false
      },
      {
        model: User,
        attributes: ["id", "name", "mobile"]
      },
      {
        model: OrderItem,
        include: [
          {
            model: Product,
            attributes: ["id", "name", "Price", "PacketsPerJar"],
            include: [
              {
                model: ProductImage,
                attributes: ["Path"],
                limit: 1,
                separate: true
              }
            ]
          }
        ]
      }
    ]
  });
};
