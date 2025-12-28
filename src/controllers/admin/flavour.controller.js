const { Flavour } = require("../../models");

/**
 * GET ALL FLAVOURS (WITH PAGINATION)
 * ?page=1&limit=10
 */
exports.getAllFlavours = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Flavour.findAndCountAll({ limit, offset, order: [["id", "DESC"]] });

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
 * GET FLAVOUR BY ID
 */
exports.getFlavourById = async (req, res) => {
  try {
    const { id } = req.params;

    const flavour = await Flavour.findByPk(id);

    if (!flavour)
      return res.status(404).json({ success: false, message: "Flavour not found" });

    return res.status(200).json({ success: true, data: flavour });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SAVE FLAVOUR (INSERT / UPDATE)
 */
exports.saveFlavour = async (req, res) => {
  try {
    const { id, flavour } = req.body;

    if (!flavour)
      return res.status(400).json({ success: false, message: "Flavour name is required" });

    // UPDATE
    if (id) {
      const existingFlavour = await Flavour.findByPk(id);

      if (!existingFlavour)
        return res.status(404).json({ success: false, message: "Flavour not found" });

      existingFlavour.flavour = flavour;
      await existingFlavour.save();

      return res.status(200).json({ success: true, message: "Flavour updated successfully", data: existingFlavour });
    }

    // INSERT
    const newFlavour = await Flavour.create({ flavour });

    return res.status(201).json({ success: true, message: "Flavour created successfully", data: newFlavour });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE FLAVOUR
 */
exports.deleteFlavour = async (req, res) => {
  try {
    const { id } = req.params;

    const flavour = await Flavour.findByPk(id);

    if (!flavour)
      return res.status(404).json({ success: false, message: "Flavour not found" });

    await flavour.destroy();

    return res.status(200).json({ success: true, message: "Flavour deleted successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
