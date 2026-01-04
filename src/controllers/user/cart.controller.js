const {
  CartItem,
  Product,
  ProductImage
} = require("../../models");

const { extractToken } = require("../../config/jwt");

/**
 * ADD PRODUCT TO CART
 */
exports.addToCart = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.id)
      return res.status(400).json({ success: false, message: "Invalid User Token." });

    const userId = Token.id;
    const { productId } = req.body;

    if (!productId)
      return res.status(400).json({ success: false, message: "ProductId is required" });

    // Prevent duplicate cart item
    const exists = await CartItem.findOne({
      where: {
        userId,
        productId
      }
    });

    if (exists)
      return res.status(200).json({ success: true, message: "Product already in cart" });

    await CartItem.create({ userId, productId });

    return res.status(201).json({ success: true, message: "Product added to cart" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * REMOVE PRODUCT FROM CART
 */
exports.removeFromCart = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.id)
      return res.status(400).json({ success: false, message: "Invalid User Token." });

    const userId = Token.id;
    const { productId } = req.params;

    await CartItem.destroy({
      where: {
        userId,
        productId
      }
    });

    return res.status(200).json({ success: true, message: "Product removed from cart" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET ALL CART ITEMS
 */
exports.getCartItems = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.id)
      return res.status(400).json({ success: false, message: "Invalid User Token." });

    const userId = Token.id;

    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price"],
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

    const data = cartItems.map(item => ({
      productId: item.Product.id,
      productName: item.Product.name,
      price: item.Product.price,
      image: item.Product.ProductImages?.[0]?.Path || null
    }));

    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};