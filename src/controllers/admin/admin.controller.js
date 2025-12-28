const bcrypt = require("bcrypt");
const { Admin } = require("../../models");
const { Permission } = require("../../models");
const { generateToken, extractToken } = require("../../config/jwt");
const { Users, Permissions} = require("../../config/permission");

/**
 * GET ALL USERS (WITH PAGINATION)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if(jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if(!TToken.permissions.includes(Users))
      return res.status(400).json({success: false, message: "you don't have permission to see users List."});

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Admin.findAndCountAll({
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [["id", "DESC"]]
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
 * GET ADMIN USER BY ID
 */
exports.getUserById = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if(jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if(!Token.permissions.includes(Users))
      return res.status(400).json({success: false, message: "you don't have permission to see user Details."});

    const { id } = req.params;

    const admin = await Admin.findByPk(id, { attributes: { exclude: ["password"] } });

    if (!admin)
      return res.status(404).json({ success: false, message: "user not found" });

    return res.status(200).json({ success: true, data: admin });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SAVE ADMIN USER (INSERT / UPDATE)
 */
exports.saveUser = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if(jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if(!TToken.permissions.includes(Users))
      return res.status(400).json({success: false, message: "you don't have permission to save user."});

    const { id, firstName, lastName, email, phoneNo, username, password, isAdmin } = req.body;

    if (!firstName || !lastName || !email || !username)
      return res.status(400).json({ success: false, message: "Required fields are missing" });

    // UPDATE
    if (id) {
      const admin = await Admin.findByPk(id);

      if (!admin)
        return res.status(404).json({ success: false, message: "user not found" });

      admin.firstName = firstName;
      admin.lastName = lastName;
      admin.email = email;
      admin.phoneNo = phoneNo;
      admin.username = username;
      admin.isAdmin = isAdmin ?? admin.isAdmin;

      if (password) {
        admin.password = await bcrypt.hash(password, 10);
      }

      await admin.save();

      return res.status(200).json({ success: true, message: "user updated successfully" });
    }

    // INSERT
    if (!password)
      return res.status(400).json({ success: false, message: "Password is required" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await AdminUser.create({ firstName, lastName, email, phoneNo, username, password: hashedPassword, isAdmin: isAdmin ?? false });

    return res.status(201).json({ success: true, message: "user created successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ACTIVE / INACTIVE ADMIN USER
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if(jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if(!TToken.permissions.includes(Users))
      return res.status(400).json({success: false, message: "you don't have permission to change user status."});

    const { id } = req.params;

    const admin = await Admin.findByPk(id);

    if (!admin)
      return res.status(404).json({ success: false, message: "user not found" });

    admin.isActive = !admin.isActive;
    await admin.save();

    return res.status(200).json({ success: true, message: `user ${admin.isActive ? "activated" : "deactivated"} successfully` });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET PERMISSIONS BY USER ID
 */
exports.getPermissionsByUserId = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if(jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if(!TToken.permissions.includes(Permissions))
      return res.status(400).json({success: false, message: "you don't have permission to see user permissions."});

    const { userId } = req.params;

    const permissions = await Permission.findAll({ where: { adminUserId: userId } });

    return res.status(200).json({ success: true, data: permissions });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SAVE PERMISSIONS (REPLACE ALL)
 * permissions: [{ pageKey, canView }]
 */
exports.savePermissions = async (req, res) => {
  try {
    const jwt = extractToken(req);
    if(jwt.success !== true)
      return res.status(400).json(jwt);

    const Token = jwt.Token;
    if(!TToken.permissions.includes(Permissions))
      return res.status(400).json({success: false, message: "you don't have permission to save user permissions."});

    const { UserId, permissions } = req.body;

    if (!UserId || !Array.isArray(permissions))
      return res.status(400).json({ success: false, message: "Invalid payload" });

    // Remove old permissions
    await Permission.destroy({ where: { UserId } });

    // Insert new permissions
    const data = permissions.map(p => ({ UserId, pageKey: p.pageKey, canView: p.canView }));

    await Permission.bulkCreate(data);

    return res.status(200).json({ success: true, message: "Permissions saved successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * ADMIN LOGIN
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const admin = await Admin.findOne({ where: { email } });
    if (!admin)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    // Fetch permissions
    const permissions = await Permission.findAll({
      where: {
        adminUserId: admin.id,
        canView: true
      },
      attributes: ["pageKey"]
    });

    const permissionKeys = permissions.map(p => p.pageKey);

    const token = generateToken({ id: admin.id, role: "AdminUser", isAdmin: admin.isAdmin, permissions: permissionKeys });

    return res.status(200).json({ success: true, message: "Admin login successful", token, permissions: permissionKeys });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
