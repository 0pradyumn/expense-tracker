const express = require("express");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/transactionController");

const router = express.Router();
router.use(auth); // every route below requires JWT

router.route("/").get(ctrl.getTransactions).post(ctrl.createTransaction);
router.route("/:id").put(ctrl.updateTransaction).delete(ctrl.deleteTransaction);

module.exports = router;
