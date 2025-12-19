const { Brand } = require("../models");

/**
 * GET ALL BRANDS
 */
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({ order: [["id", "DESC"]] });

    return res.status(200).json({ success: true, data: brands });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET BRAND BY ID
 */
exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByPk(id);

    if (!brand)
      return res.status(404).json({ success: false, message: "Brand not found" });

    return res.status(200).json({ success: true, data: brand });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SAVE BRAND (INSERT / UPDATE)
 */
exports.saveBrand = async (req, res) => {
  try {
    const { id, brand } = req.body;

    if (!brand)
      return res.status(400).json({ success: false, message: "Brand name is required" });

    // UPDATE
    if (id) {
      const existingBrand = await Brand.findByPk(id);

      if (!existingBrand)
        return res.status(404).json({ success: false, message: "Brand not found" });

      existingBrand.brand = brand;
      await existingBrand.save();

      return res.status(200).json({ success: true, message: "Brand updated successfully", data: existingBrand });
    }

    // INSERT
    const newBrand = await Brand.create({ brand });

    return res.status(201).json({ success: true, message: "Brand created successfully", data: newBrand });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE BRAND
 */
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByPk(id);

    if (!brand)
      return res.status(404).json({ success: false, message: "Brand not found" });

    await brand.destroy();

    return res.status(200).json({ success: true, message: "Brand deleted successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
