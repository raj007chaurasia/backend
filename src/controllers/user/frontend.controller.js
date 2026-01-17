const { Op } = require("sequelize");
const { Product, Brand, ProductImage, ProductTag, ProductWeight, ProductFlavour, Weight, Tag, Flavour } = require("../../models");

/**
 * CUSTOMER PRODUCT LISTING (NO LOGIN)
 */
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, search, categoryId, tagIds, weightIds, minPrice, maxPrice } = req.query;

    const limit = 12;
    const offset = (page - 1) * limit;

    const whereCondition = { IsActive: true };
    const include = [];

    // Search by product name
    if (search)
      whereCondition.name = { [Op.like]: `%${search}%` };

    //  Category filter
    if (categoryId)
      whereCondition.CategoryId = categoryId;

   
    if (minPrice || maxPrice) {
      whereCondition.Price = {};
      if (minPrice) whereCondition.Price[Op.gte] = Number(minPrice);
      if (maxPrice) whereCondition.Price[Op.lte] = Number(maxPrice);
    }

   
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


    include.push({ model: ProductImage, attributes: ["Path"] });

    const { rows, count } = await Product.findAndCountAll({
      where: whereCondition,
      include,
      distinct: true,
      limit,
      offset,
      order: [["id", "DESC"]],
      attributes: ["id", "name", "Price"]
    });

    const products = rows.map(p => ({
      id: p.id,
      name: p.name,
      price: p.Price,
      image: p.ProductImages?.[0]?.Path || null
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
    const id = req.params?.id || req.query?.id;

    if (!id)
      return res.status(400).json({ success: false, message: "Product id is required" });

    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductImage,
          attributes: ["id", "Path"]
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
          model: Flavour,
          attributes: ["id", "flavour"]
        }
      ]
    });

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    
    const dietTypeMap = {
      1: "VEG",
      2: "NON_VEG",
      3: "VEGAN",
      4: "SUGARFREE",
      5: "GLUTENFREE"
    };
    const dietTypeLabel = product.eDietType != null ? (dietTypeMap[product.eDietType] || "") : "";

    return res.status(200).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.Description,
        information: product.Information,
        rating: product.Rating,
        price: product.Price,
        discountAmount: product.DiscountPrice,
        dietType: dietTypeLabel,
        packetsPerJar: product.PacketsPerJar,
        brand: product.Brand,
        images: product.ProductImages?.map(img => img.Path) || [],
        weights: product.ProductWeights?.map(w => w.Weight) || [],
        tags: product.ProductTags?.map(t => t.Tag) || [],
        flavours: product.Flavour ? [product.Flavour] : []
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};