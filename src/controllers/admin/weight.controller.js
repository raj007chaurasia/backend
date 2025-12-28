const { Weight } = require("../../models");

/**
 * GET ALL WEIGHTS
 */
exports.getAllWeights = async (req, res) => {
  try {
    const weights = await Weight.findAll({ order: [["id", "DESC"]] });

    return res.status(200).json({ success: true, data: weights });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET WEIGHT BY ID
 */
exports.getWeightById = async (req, res) => {
  try {
    const { id } = req.params;

    const weight = await Weight.findByPk(id);

    if (!weight)
      return res.status(404).json({ success: false, message: "Weight not found" });

    return res.status(200).json({ success: true, data: weight });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SAVE WEIGHT (INSERT / UPDATE)
 */
exports.saveWeight = async (req, res) => {
  try {
    const { id, weight } = req.body;

    if (!weight)
      return res.status(400).json({ success: false, message: "Weight value is required" });

    // UPDATE
    if (id) {
      const existingWeight = await Weight.findByPk(id);

      if (!existingWeight)
        return res.status(404).json({ success: false, message: "Weight not found" });

      existingWeight.weight = weight;
      await existingWeight.save();

      return res.status(200).json({ success: true, message: "Weight updated successfully", data: existingWeight });
    }

    // INSERT
    const newWeight = await Weight.create({ weight });

    return res.status(201).json({ success: true, message: "Weight created successfully", data: newWeight });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE WEIGHT
 */
exports.deleteWeight = async (req, res) => {
  try {
    const { id } = req.params;

    const weight = await Weight.findByPk(id);

    if (!weight)
      return res.status(404).json({ success: false, message: "Weight not found" });

    await weight.destroy();

    return res.status(200).json({ success: true, message: "Weight deleted successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
