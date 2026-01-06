const Sequelize = require("../../config/db");
const { Product, ProductImage, Category, Weight, Tag, Brand, Flavour } = require("../../models");

exports.getBestSellerProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        isBestSeller: true
      },
      attributes: [
        "id",
        "name",
        "Rating",
        "Price",
        "DiscountPrice"
      ],
      include: [
        { model: ProductImage, attributes: ["Path", "GUID", "eExtension"] }
      ],
      order: [["createdAt", "DESC"]]
    });

    const response = products.map(product => ({
      id: product.id,
      productName: product.name,
      rating: product.Rating,
      price: product.Price,
      discountedPrice: product.DiscountPrice,
      image: product.ProductImages?.length ? product.ProductImages[0] : null
    }));

    return res.status(200).json({ success: true, count: response.length, data: response });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to fetch best seller products" });
  }
};

/**
 * Get all categories
 */
exports.getCategories = async (req, res) => {
  try {
    const data = await Category.findAll({ order: [["category", "ASC"]] });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error !!" });
  }
};

/**
 * Get all weights
 */
exports.getWeights = async (req, res) => {
  try {
    const data = await Weight.findAll({ order: [["weight", "ASC"]] });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error !!" });
  }
};

/**
 * Get all tags
 */
exports.getTags = async (req, res) => {
  try {
    const data = await Tag.findAll({ order: [["tag", "ASC"]] });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error !!" });
  }
};

/**
 * Get min & max product price
 */
exports.getMinMaxPrice = async (req, res) => {
  try {
    const result = await Product.findOne({
      attributes: [
        [Product.sequelize.fn("MIN", Product.sequelize.col("price")), "minPrice"],
        [Product.sequelize.fn("MAX", Product.sequelize.col("price")), "maxPrice"]
      ]
    });

    res.json({
      success: true,
      minPrice: result.get("minPrice") || 0,
      maxPrice: result.get("maxPrice") || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error !!" });
  }
};

/**
 * Get all brands
 */
exports.getBrands = async (req, res) => {
  try {
    const data = await Brand.findAll({ order: [["brand", "ASC"]] });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error !!" });
  }
};

/**
 * Get all flavours
 */
exports.getFlavours = async (req, res) => {
  try {
    const data = await Flavour.findAll({ order: [["flavour", "ASC"]] });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error !!" });
  }
};