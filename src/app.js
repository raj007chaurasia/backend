const express = require("express");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/auth.routes");
const brandRoutes = require("./routes/admin/brand.routes");
const weightRoutes = require("./routes/admin/weight.routes");
const tagRoutes = require("./routes/admin/tag.routes");
const categoryRoutes = require("./routes/admin/category.routes");
const flavourRoutes = require("./routes/admin/flavour.routes");
const productRoutes = require("./routes/admin/product.routes");
const adminRoutes = require("./routes/admin/admin.routes");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("src/uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/admin/brands", brandRoutes);
app.use("/api/admin/weights", weightRoutes);
app.use("/api/admin/tags", tagRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/flavours", flavourRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/users", adminRoutes);

module.exports = app;