const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, `.env.${(process.env.NODE_ENV || "development").trim()}`),
});

const compression = require("compression");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { readdirSync } = require("fs");
const connectDb = require("./Config/db");
const app = express();
const {
  checkOverdueTasks,
  updateOverdueTasks,
  resetDailyStreakStatus,
} = require("./job/cronJob");

connectDb();
app.use(morgan("dev"));
app.use(
  compression({
    threshold: 0,
  })
);

app.use(
  cors({
    origin: ["https://slimelist.netlify.app", "http://localhost:5173" ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-cookie"],
  })
);
app.use(cookieParser());
app.use(express.json());

app.use(
  "/uploads",
  compression(),
  express.static(path.join(__dirname, "uploads"))
);
checkOverdueTasks();

readdirSync("./Routes").map((route) =>
  app.use("/api", require("./Routes/" + route))
);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
