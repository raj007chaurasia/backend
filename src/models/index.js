const sequelize = require("../config/db");

const User = require("./user/user.model")(sequelize);
const Admin = require("./admin/admin.model")(sequelize);
const Permission = require("./admin/permission.model")(sequelize);
const Brand = require("./admin/brand.model")(sequelize);
const Weight = require("./admin/weight.model")(sequelize);
const Tag = require("./admin/tag.model")(sequelize);
const Category = require("./admin/category.model")(sequelize);
const Flavour = require("./admin/flavour.model")(sequelize);
const Product = require("./admin/product.model")(sequelize);

const ProductImage = require("./admin/productImage.model")(sequelize);
const ProductWeight = require("./admin/productWeight.model")(sequelize);
const ProductTag = require("./admin/productTag.model")(sequelize);
const ProductFlavour = require("./admin/productFlavour.model")(sequelize);



// User

const UserOtp = require("./user/userOtp.model")(sequelize);
const Wishlist = require("./user/wishlist.model")(sequelize);
const CartItem = require("./user/cartItem.model")(sequelize);

// Relations

Product.belongsTo(Brand, { foreignKey: "BrandId" });
Product.belongsTo(Category, { foreignKey: "CategoryId" });

Product.hasMany(ProductImage, { foreignKey: "ProductId" });
Product.hasMany(ProductWeight, { foreignKey: "ProductId" });
Product.hasMany(ProductTag, { foreignKey: "ProductId" });
Product.hasMany(ProductFlavour, { foreignKey: "ProductId" });

ProductWeight.belongsTo(Weight, { foreignKey: "WeightId" });
ProductTag.belongsTo(Tag, { foreignKey: "TagId" });
ProductFlavour.belongsTo(Flavour, { foreignKey: "FlavourId" });



module.exports = {
  sequelize,
  User,
  Admin,
  Brand,
  Weight,
  Tag,
  Category,
  Flavour,
  Product,
  ProductImage,
  ProductWeight,
  ProductTag,
  ProductFlavour,
  Permission,


  UserOtp,
  Wishlist,
  CartItem
};
