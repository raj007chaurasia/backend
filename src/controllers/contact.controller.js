const db = require("../models");
const Contact = db.Contact;

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).send({ success: false, message: "Name, email and message are required." });
    }
    const data = await Contact.create({ name, email, phone, message });
    res.send({ success: true, message: "Message sent successfully.", data });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).send({ success: false, message: error.message || "Some error occurred." });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const data = await Contact.findAll({ order: [['createdAt', 'DESC']] });
    res.send({ success: true, data });
  } catch (error) {
    console.error("Error getting contacts:", error);
    res.status(500).send({ success: false, message: error.message || "Some error occurred." });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.destroy({ where: { id } });
    res.send({ success: true, message: "Message deleted successfully." });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};
