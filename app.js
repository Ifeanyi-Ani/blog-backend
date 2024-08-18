const express = require("express");
const path = require("path");
const globalErr = require("./controllers/errController");
const AppErr = require("./utils/appErr");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");
const commentRoute = require("./routes/comments");
const likeRoute = require("./routes/likes");
const credentials = require("./middleware/credentials");
const corOptions = require("./config/corOptions");

const App = express();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

App.use(credentials);
App.use(cors(corOptions));
// App.use(cors({
//   origin: 'https://tumlr-ani.netlify.app'
// }));

// App.options("*", cors());

App.use(express.static(path.join(__dirname, "public")));
App.use(helmet());
App.use(bodyParser.json());
App.use(express.json());
App.use(express.urlencoded({ extended: true }));
App.use(cookieParser());
App.use(morgan("short"));

App.use((req, _res, next) => {
  req.requesTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

App.use("/comments", commentRoute);
App.use(likeRoute);
App.use("/users", userRoute);
App.use("/auth", authRoute);
App.use("/posts", postRoute);

App.all("*", (req, _res, next) => {
  next(new AppErr(`Can't find ${req.originalUrl} on this server!`, 404));
});
App.use(globalErr);

module.exports = App;
