const express = require("express");
const app = express();
const AppRouter = require("./routes/index");
const cors = require("cors");
const dotenv = require("dotenv");

const port = process.env.PORT || 5000;

//Middleware
dotenv.config();
app.use(express.json());
app.use(cors());

app.use("/api/", AppRouter);

app.listen(port, () => console.log(`Listening on port ${port}`));
