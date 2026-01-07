const { extractToken } = require("../../config/jwt");
const { CustomerAddress, User } = require("../../models");
const { Op } = require("sequelize");

/**
 * Add new address
 */
exports.saveAddress = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.id)
      return res.status(400).json({ success: false, message: "Invalid User Token." });

    const userId = Token.id;

    const { id, title, address, city, state, country, pincode } = req.body;

    if (isNaN(id) || id < 0)
      res.status(400).json({ success: false, message: "id is Invalid." });

    let Address;
    if (id > 0) {
      Address = await CustomerAddress.findByPk(id);

      if (!Address)
        res.status(400).json({ success: false, message: "address not found." });

      await Address.update({
        title: title,
        address: address,
        city: city,
        state: state,
        country: country,
        pincode: pincode
      })

      res.status(201).json({ success: true, message: "Address added successfully" });
    }
    else {
      Address = await CustomerAddress.create({
        userId,
        title: title,
        address: address,
        city: city,
        state: state,
        country: country,
        pincode: pincode
      });

      res.status(201).json({ success: true, message: "Address added successfully" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error !!" });
  }
};

/**
 * Get all addresses of logged-in user
 */
exports.getAllAddresses = async (req, res) => {
  try {

    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.id)
      return res.status(400).json({ success: false, message: "Invalid User Token." });

    const userId = Token.id;

    const data = await CustomerAddress.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]]
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error !!" });
  }
};

/**
 * Get address by ID (own address only)
 */
exports.getAddressById = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.id)
      return res.status(400).json({ success: false, message: "Invalid User Token." });

    const userId = Token.id;
    const { id } = req.params;

    const address = await CustomerAddress.findOne({ where: { id, userId } });

    if (!address)
      return res.status(404).json({ success: false, message: "Address not found" });

    res.json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error !!" });
  }
};

/**
 * CHANGE PASSWORD
 */
exports.changePassword = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.id)
      return res.status(400).json({ success: false, message: "Invalid User Token." });

    const userId = Token.id;

    const { email, oldPassword, newPassword } = req.body;

    if (!email)
      res.status(400).json({ success: false, message: "Email is required." });

    if (!oldPassword)
      res.status(400).json({ success: false, message: "Old Password is required." });

    if (!newPassword)
      res.status(400).json({ success: false, message: "New Password is required." });

    email = email.trim();
    oldPassword = oldPassword.trim();
    newPassword = newPassword.trim();

    if (oldPassword == newPassword)
      res.status(400).json({ success: false, message: `New Password can not be same as Old Password.` });

    var objUser = User.findByPk(userId);
    if (!objUser)
      res.status(400).json({ success: false, message: `User not found.` });

    if (objUser.email != email)
      res.status(400).json({ success: false, message: `Invalid Email Address.` });

    var enc = await bcrypt.hash(oldPassword, 10);
    if (enc !== objUser.password)
      res.status(400).json({ success: false, message: "Invalid Old Password." });

    objUser.password = await bcrypt.hash(newPassword, 10);
    await objUser.save();

    res.status(200).json({ success: true, message: "Password changed successfully." });
  }
  catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error !!" });
  }
}

/**
 * USER DETAILS UPDATE
 */
exports.updateUserDetails = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if (jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if (!Token.id)
      return res.status(400).json({ success: false, message: "Invalid User Token." });

    const userId = Token.id;

    const { name, email, mobile } = req.body;

    if (!name || !email || !mobile)
      return res.status(400).json({ success: false, message: "All fields are required." });

    if (mobile.length < 10)
      return res.status(400).json({ success: false, message: "mobile number is invalid." });
    
    const existingUser = await User.findOne({ where: { email, id: { [Op.ne]: userId } } });
    if (existingUser)
      return res.status(409).json({ success: false, message: "User already exists with this email" });
    
    const objUser = await User.findByPk(userId);
    if(!objUser)
      return res.status(400).json({ success: false, message: "User not found." });

    objUser.name = name;
    objUser.email = email;
    objUser.mobile = mobile;

    await objUser.save();

    return res.status(201).json({ success: true, message: "User registered successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
