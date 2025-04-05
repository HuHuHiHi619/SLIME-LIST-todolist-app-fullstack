const compression = require("compression");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { readdirSync } = require("fs");
const connectDb = require("./Config/db");
const app = express();
const path = require("path");
const {
  checkOverdueTasks,
  updateOverdueTasks,
  resetDailyStreakStatus,
} = require("./job/cronJob");
const mongoSanitize = require("express-mongo-sanitize");

const imagesPath = path.join(__dirname, "../images/badges");
require("dotenv").config();
connectDb();

app.use(morgan("dev"));
app.use(
  compression({
    threshold: 0,
  })
);

app.use(
  cors({
    origin: ["https://slimelist.netlify.app", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(mongoSanitize());
app.use(
  "/uploads",
  compression(),
  express.static(path.join(__dirname, "uploads"))
);
app.use("/images", compression(), express.static(imagesPath));

checkOverdueTasks();

readdirSync("./Routes").map((route) =>
  app.use("/api", require("./Routes/" + route))
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
