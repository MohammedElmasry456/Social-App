const authRoute = require("./authRoute");
const commentRoute = require("./commentRoute");
const postRoute = require("./postRoute");
const userRoute = require("./userRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/posts", postRoute);
  app.use("/api/v1/comments", commentRoute);
};

module.exports = mountRoutes;
