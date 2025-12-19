const {
  Product,
  ProductImage,
  ProductWeight,
  ProductTag,
  ProductFlavour,
  Brand,
  Category,
  Weight,
  Tag,
  Flavour
} = require("../models");

/**
 * GET ALL PRODUCTS (WITH PAGINATION)
 */
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Product.findAndCountAll({
      limit,
      offset,
      order: [["id", "DESC"]],
      include: [
        { model: Brand },
        { model: Category },
        { model: ProductImage },
        { model: ProductWeight, include: [Weight] },
        { model: ProductTag, include: [Tag] },
        { model: ProductFlavour, include: [Flavour] }
      ]
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        limit
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET PRODUCT BY ID
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Brand },
        { model: Category },
        { model: ProductImage },
        { model: ProductWeight, include: [Weight] },
        { model: ProductTag, include: [Tag] },
        { model: ProductFlavour, include: [Flavour] }
      ]
    });

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    return res.status(200).json({ success: true, data: product });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SAVE PRODUCT (INSERT / UPDATE)
 */
exports.saveProduct = async (req, res) => {
  const t = await Product.sequelize.transaction();

  let message = "";

  try {
    const {
      id,
      name,
      description,
      rating,
      price,
      brandId,
      eDietType,
      categoryId,
      weights = [],
      tags = [],
      flavours = [],
      images = []
    } = req.body;

    if (!name || !price)
      return res.status(400).json({ success: false, message: "Product name and price are required" });

    let product;

    // UPDATE
    if (id) {
      product = await Product.findByPk(id);

      if (!product)
        return res.status(404).json({ success: false, message: "Product not found" });

      await product.update(
        {
          name,
          description,
          rating,
          price,
          BrandId: brandId,
          eDietType,
          CategoryId: categoryId
        },
        { transaction: t }
      );

      // Remove old mappings
      await ProductWeight.destroy({ where: { ProductId: id }, transaction: t });
      await ProductTag.destroy({ where: { ProductId: id }, transaction: t });
      await ProductFlavour.destroy({ where: { ProductId: id }, transaction: t });

      message = "Product updated successfully";

    } else {
      // INSERT
      product = await Product.create(
        {
          name,
          description,
          rating,
          price,
          BrandId: brandId,
          eDietType,
          CategoryId: categoryId
        },
        { transaction: t }
      );

      message = "Product created successfully";
    }

    // Weights
    if (weights.length) {
      const weightData = weights.map(w => ({ ProductId: product.id, WeightId: w }));
      await ProductWeight.bulkCreate(weightData, { transaction: t });
    }

    // Tags
    if (tags.length) {
      const tagData = tags.map(tg => ({ ProductId: product.id, TagId: tg }));
      await ProductTag.bulkCreate(tagData, { transaction: t });
    }

    // Flavours
    if (flavours.length) {
      const flavourData = flavours.map(f => ({ ProductId: product.id, FlavourId: f }));
      await ProductFlavour.bulkCreate(flavourData, { transaction: t });
    }

    // Images (metadata only – upload handled separately)
    if (images.length) {
      const imageData = images.map(img => ({ ProductId: product.id, guid: img.guid, path: img.path, eExtension: img.eExtension }));
      await ProductImage.bulkCreate(imageData, { transaction: t });
    }

    await t.commit();

    return res.status(id ? 200 : 201).json({ success: true, message: message, productId: product.id });

  } catch (error) {
    await t.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE PRODUCT
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    await ProductImage.destroy({ where: { ProductId: id } });
    await ProductWeight.destroy({ where: { ProductId: id } });
    await ProductTag.destroy({ where: { ProductId: id } });
    await ProductFlavour.destroy({ where: { ProductId: id } });
    await product.destroy();

    return res.status(200).json({ success: true, message: "Product deleted successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
