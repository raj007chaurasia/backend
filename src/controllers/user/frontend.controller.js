const { Op } = require("sequelize");
const { Product, Brand, ProductImage, ProductTag, ProductWeight, ProductFlavour, Weight, Tag, Flavour } = require("../models");

/**
 * CUSTOMER PRODUCT LISTING (NO LOGIN)
 */
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, search, categoryId, tagIds, weightIds, minPrice, maxPrice } = req.query;

    const limit = 12;
    const offset = (page - 1) * limit;

    const whereCondition = {};
    const include = [];

    // 🔍 Search by product name
    if (search)
      whereCondition.name = { [Op.like]: `%${search}%` };

    // 📂 Category filter
    if (categoryId)
      whereCondition.CategoryId = categoryId;

    // 💰 Price filter
    if (minPrice || maxPrice) {
      whereCondition.price = {};
      if (minPrice) whereCondition.price[Op.gte] = minPrice;
      if (maxPrice) whereCondition.price[Op.lte] = maxPrice;
    }

    // 🏷️ Tag filter
    if (tagIds) {
      include.push({
        model: ProductTag,
        required: true,
        where: {
          TagId: {
            [Op.in]: tagIds.split(",")
          }
        },
        include: [{ model: Tag }]
      });
    }

    // ⚖️ Weight filter
    if (weightIds) {
      include.push({
        model: ProductWeight,
        required: true,
        where: {
          WeightId: {
            [Op.in]: weightIds.split(",")
          }
        }
      });
    }

    // 🖼️ Product Image (1 image only)
    include.push({ model: ProductImage, attributes: ["path"], limit: 1 });

    const { rows, count } = await Product.findAndCountAll({
      where: whereCondition,
      include,
      distinct: true,
      limit,
      offset,
      order: [["id", "DESC"]],
      attributes: ["id", "name", "price"]
    });

    const products = rows.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.ProductImages?.[0]?.path || null
    }));

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalProducts: count,
        currentPage: Number(page),
        totalPages: Math.ceil(count / limit),
        perPage: limit
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * CUSTOMER PRODUCT DETAILS (NO LOGIN)
 */
exports.getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductImage,
          attributes: ["id", "path"]
        },
        {
          model: Brand,
          attributes: ["id", "brand"]
        },
        {
          model: ProductWeight,
          include: [{ model: Weight, attributes: ["id", "weight"] }]
        },
        {
          model: ProductTag,
          include: [{ model: Tag, attributes: ["id", "tag"] }]
        },
        {
          model: ProductFlavour,
          include: [{ model: Flavour, attributes: ["id", "flavour"] }]
        }
      ]
    });

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        rating: product.rating,
        price: product.price,
        dietType: product.eDietType,
        brand: product.Brand,
        images: product.ProductImages.map(img => img.path),
        weights: product.ProductWeights.map(w => w.Weight),
        tags: product.ProductTags.map(t => t.Tag),
        flavours: product.ProductFlavours.map(f => f.Flavour)
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};