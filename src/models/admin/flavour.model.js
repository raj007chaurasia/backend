const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Flavour = sequelize.define(
    "Flavour",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      flavour: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: "flavours"
    }
  );

  return Flavour;
};
