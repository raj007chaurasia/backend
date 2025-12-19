const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Brand = sequelize.define("Brand", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    brand: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: "brands"
  });

  return Brand;
};
