const { Settings } = require("../../models");

/**
 * Create or Update General Settings (Single Record)
 */
exports.saveGeneralSettings = async (req, res) => {
  try {
    const { logo, contactNo, email, address, openingTime, closingTime, facebook, instagram, youtube, linkedin } = req.body;

    const existing = await Settings.findOne();

    let data;

    if (existing) {
      data = await existing.update({ logo, contactNo, email, address, openingTime, closingTime, facebook, instagram, youtube, linkedin });
    } else {
      data = await Settings.create({ logo, contactNo, email, address, openingTime, closingTime, facebook, instagram, youtube, linkedin });
    }

    return res.status(200).json({ success: true, message: "General settings saved successfully", data });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to save general settings" });
  }
};

/**
 * Get General Settings (Public or Admin)
 */
exports.getGeneralSettings = async (req, res) => {
  try {
    const data = await Settings.findOne();

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch general settings" });
  }
};
