const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/cash-in", authMiddleware, transactionController.cashIn);
router.post("/cash-out", authMiddleware, transactionController.cashOut);
router.get("/", authMiddleware, transactionController.getTransactions);
router.get("/summary", authMiddleware, transactionController.getSummary);

module.exports = router;
