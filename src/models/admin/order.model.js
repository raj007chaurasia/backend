const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define("Order", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    OrderNo: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    OrderDate: {
      type: DataTypes.DATE,
      allowNull: true
    },

    CustomerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    Amount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },

    PaidAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0
    },

    // 0 = Unpaid, 1 = Partially Paid, 2 = Paid
    ePaymentStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    eOrderStatus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    TransactionId: {
      type: DataTypes.STRING,
      allowNull: true
    },

    AddressId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: "orders"
  });

  return Order;
};
