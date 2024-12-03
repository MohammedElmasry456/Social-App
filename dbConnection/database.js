const mongoose = require("mongoose");

const dbConnection = async () => {
  mongoose.connect(process.env.DB).then((res) => {
    console.log(`dataBase Connected | ${res.connection.host}`);
  });
};

module.exports = dbConnection;
