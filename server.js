const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const dbConnection = require("./dbConnection/database");
require("dotenv").config({ path: "config.env" });
const mountRoutes = require("./routes");
const ApiError = require("./utils/apiError");
const glopalError = require("./middlewares/errorMiddleware");

const app = express();
const port = process.env.PORT;

//dbConnection
dbConnection();

//middlewares
app.use(express.json());
app.use(express.static("uploads"));
app.use(helmet());
if (process.env.MODE === "DEV") app.use(morgan("dev"));

//Mount Routes
mountRoutes(app);
app.get("/", (req, res) => {
  res.status(200).send({ message: "hello world" });
});
app.all("*", (req, res, next) => next(new ApiError("page not found", 404)));

//Handle Glopal Error
app.use(glopalError);

//server connection
const server = app.listen(port, () => {
  console.log(`Server Is Running On Port ${port}`);
});

//unhandled Error
process.on("unhandledRejection", (error) => {
  console.error(`unhandled Rejection Error | ${error}`);
  server.close(() => {
    console.log("Server Shutting Down...");
    process.exit(1);
  });
});
