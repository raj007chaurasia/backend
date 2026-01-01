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

      FlavourId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      Weight: {
        type: DataTypes.STRING,
        allowNull: true
      },

      Qty: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      MinQty: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      IsBestSeller: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },

      IsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      }
    },
    {
      tableName: "products"
    }
  );

  return Product;
};
