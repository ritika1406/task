require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors());

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50
  }),
  authRoutes
);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "expense-tracker-api"
  });
});

app.use("/api/transactions", transactionRoutes);

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "CSV exceeds the configured size limit"
    });
  }

  if (err.message === "Only CSV files are supported") {
    return res.status(400).json({
      message: err.message
    });
  }

  console.error(err);
  res.status(500).json({
    message: "Internal server error"
  });
});

module.exports = app;
