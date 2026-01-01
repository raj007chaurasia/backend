const router = require("express").Router();

const { getDashboardCounts, getTopSellingProducts, getTopCustomers } = require("../../controllers/admin/dashboard.controller");

router.get("/counts", getDashboardCounts);
router.get("/top-products", getTopSellingProducts);
router.get("/top-customers", getTopCustomers);

module.exports = router;
