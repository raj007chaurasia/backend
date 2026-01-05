const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OrderItem = sequelize.define("OrderItem", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    OrderId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    ItemId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    Qty: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },

    Price: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },

    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: "orderItems"
  });

  return OrderItem;
};
