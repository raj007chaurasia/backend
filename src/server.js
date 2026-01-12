require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
    console.log("Database connected");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
    .catch((err) => {
        console.error("❌ DB Sync Error:", err.message);
    });
