require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./models");

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base URL → Welcome Message
app.get("/", (req, res) => {
  res.send("Welcome to Book Keeping API 🚀");
});

// Health Check API
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    app: "Book Keeping API",
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
app.use("/auth", require("./routes/auth"));
app.use("/transactions", require("./routes/transactions"));

const PORT = process.env.PORT || 3000;

db.sequelize.sync().then(() => {
  console.log("Database connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
