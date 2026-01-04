const { extractToken } = require("../../config/jwt");
const { CustomerAddress } = require("../../models");

/**
 * Add new address
 */
exports.saveAddress = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if(jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if(!Token.id)
      return res.status(400).json({success: false, message: "Invalid User Token."});

    const userId = Token.id;

    const address = await CustomerAddress.create({
      userId,
      title: req.body.title,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      pincode: req.body.pincode
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get all addresses of logged-in user
 */
exports.getAllAddresses = async (req, res) => {
  try {
    
    const jwt = extractToken(req);
    if(jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if(!Token.id)
      return res.status(400).json({success: false, message: "Invalid User Token."});

    const userId = Token.id;

    const data = await CustomerAddress.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]]
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get address by ID (own address only)
 */
exports.getAddressById = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if(jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if(!Token.id)
      return res.status(400).json({success: false, message: "Invalid User Token."});

    const userId = Token.id;
    const { id } = req.params;

    const address = await CustomerAddress.findOne({ where: { id, userId } });

    if (!address)
      return res.status(404).json({ success: false, message: "Address not found" });

    res.json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};