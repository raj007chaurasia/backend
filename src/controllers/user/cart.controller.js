const {
  CartItem,
  Product,
  ProductImage
} = require("../../models");

/**
 * ADD PRODUCT TO CART
 */
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId)
      return res.status(400).json({ success: false, message: "ProductId is required" });

    // Prevent duplicate cart item
    const exists = await CartItem.findOne({
      where: {
        userId: userId,
        ProductId: productId
      }
    });

    if (exists)
      return res.status(200).json({ success: true, message: "Product already in cart" });

    await CartItem.create({ userId: userId, ProductId: productId });

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
    const userId = req.user.id;
    const { productId } = req.params;

    await CartItem.destroy({
      where: {
        userId: userId,
        ProductId: productId
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
    const userId = req.user.id;

    const cartItems = await CartItem.findAll({
      where: { userId: userId },
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
      order: [["CartId", "DESC"]]
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