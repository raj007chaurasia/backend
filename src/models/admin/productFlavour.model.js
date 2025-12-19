const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductFlavour = sequelize.define(
    "ProductFlavour",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      ProductId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      FlavourId: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: "productFlavours"
    }
  );

  return ProductFlavour;
};
