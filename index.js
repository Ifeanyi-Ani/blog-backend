const mongoose = require("mongoose");
require("dotenv").config();

const App = require("./app");

const PORT = 4000;

mongoose.connect(process.env.DATABASE, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
mongoose.connection.on("open", () => console.log("server is connected"));
mongoose.connection.on("error", (error) => console.log(error));

App.listen(PORT, () => console.log("server is running"));
