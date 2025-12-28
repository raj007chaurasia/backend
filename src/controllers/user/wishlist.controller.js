const {
  ProductWishlist,
  Product,
  ProductImage
} = require("../../models");

/**
 * ADD TO WISHLIST
 */
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId)
      return res.status(400).json({ success: false, message: "ProductId is required" });

    const exists = await ProductWishlist.findOne({ where: { UserId: userId, ProductId: productId } });

    if (exists)
      return res.status(200).json({ success: true, message: "Product already in wishlist" });

    await ProductWishlist.create({ UserId: userId, ProductId: productId });

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
    const userId = req.user.id;
    const { productId } = req.params;

    await ProductWishlist.destroy({
      where: {
        UserId: userId,
        ProductId: productId
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
    const userId = req.user.id;

    const wishlist = await ProductWishlist.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price"],
          include: [
            {
              model: ProductImage,
              attributes: ["path"],
              limit: 1
            }
          ]
        }
      ],
      order: [["WishlistId", "DESC"]]
    });

    const data = wishlist.map(item => ({
      productId: item.Product.id,
      productName: item.Product.name,
      price: item.Product.price,
      image: item.Product.ProductImages?.[0]?.path || null
    }));

    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};