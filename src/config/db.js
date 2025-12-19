const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false
  }
);

// Test connection
sequelize.authenticate()
  .then(() => {
    console.log("✅ MySQL Database Connected Successfully");
  })
  .catch((error) => {
    console.error("❌ Unable to connect to database:", error.message);
  });

module.exports = sequelize;
