const db = require("../models");
const Transaction = db.Transaction;

exports.cashIn = async (req, res) => {
  try {
    const { amount, category, note, date } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      type: "cash_in",
      amount,
      category,
      note,
      date: date || new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Cash in added",
      data: transaction,
    });
  } catch (err) {
    console.error("CASH IN ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.cashOut = async (req, res) => {
    try {
      const { amount, category, note, date } = req.body;
  
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
  
      const transaction = await Transaction.create({
        userId: req.user.id,
        type: "cash_out",
        amount,
        category,
        note,
        date: date || new Date(),
      });
  
      return res.status(201).json({
        success: true,
        message: "Cash out added",
        data: transaction,
      });
    } catch (err) {
      console.error("CASH OUT ERROR:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  exports.getTransactions = async (req, res) => {
    try {
      const transactions = await Transaction.findAll({
        where: { userId: req.user.id },
        order: [["date", "DESC"]],
      });
  
      res.json({
        success: true,
        data: transactions,
      });
    } catch (err) {
      console.error("GET TRANSACTIONS ERROR:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  
  exports.getSummary = async (req, res) => {
    try {
      const transactions = await Transaction.findAll({
        where: { userId: req.user.id },
      });
  
      let cashIn = 0;
      let cashOut = 0;
  
      transactions.forEach((t) => {
        if (t.type === "cash_in") cashIn += Number(t.amount);
        if (t.type === "cash_out") cashOut += Number(t.amount);
      });
  
      res.json({
        success: true,
        data: {
          cashIn,
          cashOut,
          balance: cashIn - cashOut,
        },
      });
    } catch (err) {
      console.error("SUMMARY ERROR:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  