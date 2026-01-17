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
const orderRoutes = require("./routes/admin/order.routes");
const settingsRoutes = require("./routes/admin/settings.routes");
const dashboardRoutes = require("./routes/admin/dashboard.routes");
const contactRoutes = require("./routes/contact.routes");


// const customerProductRoutes = require("./routes/user/customerProduct.routes");
const userRoutes = require("./routes/user/user.routes");
const wishlistRoutes = require("./routes/user/wishlist.routes");
const cartRoutes = require("./routes/user/cart.routes");
const productsRoutes = require("./routes/user/product.routes");



app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("src/uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/brands", brandRoutes);
app.use("/api/admin/weights", weightRoutes);
app.use("/api/admin/tags", tagRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/flavours", flavourRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/contact", contactRoutes);



// app.use("/api/products", customerProductRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;