const {
  ProductWishlist,
  Product,
  ProductImage
} = require("../../models");

const { extractToken } = require("../../config/jwt");

/**
 * ADD TO WISHLIST
 */
exports.addToWishlist = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.id)
      return res.status(400).json({ success: false, message: "Invalid User Token." });

    const userId = Token.id;
    const productId = req.params.productId || req.body.productId;

    if (!productId)
      return res.status(400).json({ success: false, message: "ProductId is required" });

    const exists = await ProductWishlist.findOne({ where: { userId, productId } });

    if (exists)
      return res.status(200).json({ success: true, message: "Product already in wishlist" });

    await ProductWishlist.create({ userId, productId });

    return res.status(201).json({ success: true, message: "Product added to wishlist" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * REMOVE FROM WISHLIST
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.id)
      return res.status(400).json({ success: false, message: "Invalid User Token." });

    const userId = Token.id;
    const { productId } = req.params;

    await ProductWishlist.destroy({
      where: {
        userId,
        productId
      }
    });

    return res.status(200).json({ success: true, message: "Product removed from wishlist" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET USER WISHLIST
 */
exports.getWishlist = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.id)
      return res.status(400).json({ success: false, message: "Invalid User Token." });

    const userId = Token.id;

    const wishlist = await ProductWishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "Price"],
          include: [
            {
              model: ProductImage,
              attributes: ["Path"],
              limit: 1
            }
          ]
        }
      ],
      order: [["id", "DESC"]]
    });

    const data = wishlist.map(item => ({
      productId: item.Product.id,
      productName: item.Product.name,
      price: item.Product.Price,
      image: item.Product.ProductImages?.[0]?.Path || null
    }));

    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};