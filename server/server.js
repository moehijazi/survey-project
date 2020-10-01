const express = require("express");
const app = express();
const AppRouter = require("./routes/index");
const cors = require("cors");
const dotenv = require("dotenv");
const { schedule, initialSetup } = require("./services/CronJobs");

const port = process.env.PORT || 3001;

//Middleware
dotenv.config();
app.use(express.json());
app.use(cors());

const corsfix = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
};

initialSetup();
app.get("/server/api", async (req, res) => {
  try {
  } catch (error) {}
});

app.use("/api/", corsfix, AppRouter);

app.listen(port, () => console.log(`Listening on port ${port}`));
