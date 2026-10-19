const express = require("express");
const auth = require("../middleware/auth");
const { getMonthlySummary, getYearlySummary } = require("../controllers/summaryController");

const router = express.Router();
router.use(auth);

router.get("/monthly", getMonthlySummary);
router.get("/yearly", getYearlySummary);

module.exports = router;
