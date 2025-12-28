const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      name: {
        type: DataTypes.STRING,
        allowNull: true
      },

      Description: {
        type: DataTypes.STRING,
        allowNull: true
      },

      Information: {
        type: DataTypes.STRING,
        allowNull: true
      },

      Rating: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },

      Price: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },

      DiscountPrice: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },

      BrandId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      eDietType: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      CategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      Qty: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: "products"
    }
  );

  return Product;
};
