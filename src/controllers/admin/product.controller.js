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
} = require("../../models");

const Sequelize = require("../../config/db");
const { Products } = require("../../config/permission");
const { extractToken } = require("../../config/jwt");
const { where } = require("sequelize");

/**
 * GET ALL PRODUCTS (WITH PAGINATION)
 */
exports.getAllProducts = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Products))
      return res.status(400).json({ success: false, message: "you don't have permission to view product list." });

    const { categoryId, brandId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = {};

    if (categoryId)
      whereCondition.CategoryId = categoryId;

    if (brandId)
      whereCondition.BrandId = brandId;

    const { rows, count } = await Product.findAndCountAll({
      limit,
      offset,
      where: whereCondition,
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
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Products))
      return res.status(400).json({ success: false, message: "you don't have permission to view product." });

    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Brand },
        { model: Category },
        { model: ProductImage },
        { model: ProductTag, include: [Tag] }
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
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Products))
      return res.status(400).json({ success: false, message: "you don't have permission to save product." });

    const { id, name, description, information, rating, price, discountPrice, brandId, categoryId, flavourId, eDietType, qty, weight,minQty, tags = [], images = [] } = req.body;

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    const imagesFromBody = Array.isArray(images) ? images : [];

    if (!name)
      return res.status(400).json({ success: false, message: "Product name is required" });

    if (!price)
      return res.status(400).json({ success: false, message: "price is required" });

    if (!brandId)
      return res.status(400).json({ success: false, message: "Brand is required" });

    if (!categoryId)
      return res.status(400).json({ success: false, message: "Category is required" });

    if (!flavourId)
      return res.status(400).json({ success: false, message: "Flavour is required" });

    if (!weight)
      return res.status(400).json({ success: false, message: "Weight is required" });

    if (!eDietType)
      return res.status(400).json({ success: false, message: "Diet Type is required" });

    if (!qty || qty < 0)
      return res.status(400).json({ success: false, message: "Stock Quantity is required" });

     if (!minQty || minQty <= 0)
      return res.status(400).json({ success: false, message: "Minimum Quantity is required" });

    if (uploadedFiles.length === 0 && imagesFromBody.length === 0)
      return res.status(400).json({ success: false, message: "images are required" });

    let product;

    // UPDATE
    if (id) {
      product = await Product.findByPk(id);

      if (!product)
        return res.status(404).json({ success: false, message: "Product not found" });

      await product.update(
        {
          name: name,
          Description: description,
          Information: information,
          Rating: rating,
          Price: price,
          DiscountPrice: discountPrice,
          BrandId: brandId,
          eDietType: eDietType,
          CategoryId: categoryId,
          Qty: qty,
          MinQty: minQty,
          FlavourId: flavourId,
          Weight: weight
        },
        { transaction: t }
      );

      // Remove old mappings
      await ProductTag.destroy({ where: { ProductId: id }, transaction: t });

      message = "Product updated successfully";

    } else {
      // INSERT
      product = await Product.create(
        {
          name: name,
          Description: description,
          Information: information,
          Rating: rating,
          Price: price,
          DiscountPrice: discountPrice,
          BrandId: brandId,
          eDietType: eDietType,
          CategoryId: categoryId,
          Qty: qty,
          MinQty: minQty,
          FlavourId: flavourId,
          Weight: weight
        },
        { transaction: t }
      );

      message = "Product created successfully";
    }

    // Tags
    if (tags.length) {
      const tagData = tags.map(tg => ({ ProductId: product.id, TagId: tg }));
      await ProductTag.bulkCreate(tagData, { transaction: t });
    }

    // Images (supports multipart uploads and legacy JSON metadata)
    if (uploadedFiles.length) {
      const imageData = uploadedFiles.map(file => ({
        ProductId: product.id,
        GUID: file.filename,
        Path: `/uploads/products/${file.filename}`,
        eExtension: null
      }));
      await ProductImage.bulkCreate(imageData, { transaction: t });
    } else if (imagesFromBody.length) {
      const imageData = imagesFromBody.map(img => ({
        ProductId: product.id,
        GUID: img.guid,
        Path: img.path,
        eExtension: img.eExtension
      }));
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

    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Products))
      return res.status(400).json({ success: false, message: "you don't have permission to delete product." });

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

/**
 * UPDATE PRODUCT STATUS (ACTIVE / DEACTIVE)
 */
exports.changeStatusProduct = async (req, res) => {
  try {

    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Products))
      return res.status(400).json({ success: false, message: "you don't have permission to update product." });

    const { id, isActive } = req.body;

    if (!id || !isActive)
      return res.status(400).json({ success: false, message: "Product id and status are required" });

    let product = await Product.findByPk(id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    await product.update({ isActive });

    return res.status(200).json({ success: true, message: "Product Status Updated successfully" });

  } catch (error) { 
    await t.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SET PRODUCT BEST SELLER
 */
exports.setBestSellerProduct = async (req, res) => {
  try {

    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Products))
      return res.status(400).json({ success: false, message: "you don't have permission to update product." });

    const { id, isBestSeller } = req.body;

    if (!id || !isBestSeller)
      return res.status(400).json({ success: false, message: "Product id and status are required" });

    let product = await Product.findByPk(id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    await product.update({ IsBestSeller: isBestSeller });

    return res.status(200).json({ success: true, message: "Product Status Updated successfully" });

  } catch (error) {
    await t.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get products with low stock (qty < minQty)
 */
exports.getLowStockProducts = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Products))
      return res.status(400).json({ success: false, message: "you don't have permission to update product." });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const products = await Product.findAll({
      limit,
      offset,
      where: {
        qty: {
          [Op.lt]: col("MinQty")
        }
      },
      attributes: [
        "name",
        "Qty",
        "IsActive"
      ],
      include: [
        {
          model: Category,
          attributes: ["category"]
        },
        {
          model: Brand,
          attributes: ["brand"]
        }
      ],
      order: [["Qty", "ASC"]]
    });

    const response = products.map(p => ({
      productName: p.name,
      categoryName: p.Category?.category || null,
      brandName: p.Brand?.brand || null,
      isActive: p.IsActive,
      qty: p.Qty
    }));

    return res.status(200).json({ success: true, count: response.length, data: response });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch low stock products" });
  }
};

/**
 * Increase or Decrease Product Qty
 */
exports.updateProductStock = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.permissions.includes(Products))
      return res.status(400).json({ success: false, message: "you don't have permission to update product." });

    const { id } = req.params;
    const { qty, action } = req.body;

    if (!qty || qty <= 0)
      return res.status(400).json({ success: false, message: "Qty must be greater than 0" });

    if (!["increase", "decrease"].includes(action))
      return res.status(400).json({ success: false, message: "Action must be 'increase' or 'decrease'" });

    const product = await Product.findByPk(id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    let newQty = product.qty;

    if (action === "increase") {
      newQty += qty;
    }
    else {
      if (product.qty < qty)
        return res.status(400).json({ success: false, message: "Insufficient stock" });

      newQty -= qty;
    }

    await product.update({ qty: newQty });

    return res.status(200).json({
      success: true,
      message: `Product stock ${action}d successfully`
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update product stock" });
  }
};