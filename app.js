const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");

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

// const limiter = rateLimit({
//   max: 200,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests for this IP, please try again in an hour",
// });
App.use(helmet());
// App.use(limiter);
App.use(credentials);
App.use(cors(corOptions));
// App.use(cors({
//   origin: 'https://tumlr-ani.netlify.app'
// }));

// App.options("*", cors());

App.use(express.static(path.join(__dirname, "public")));
App.use(express.json());
App.use(express.urlencoded({ extended: true }));

App.use(mongoSanitize());
App.use(xssClean());

App.use(cookieParser());

App.use(morgan("dev"));

App.use((req, _res, next) => {
  req.requesTime = new Date().toISOString();
  next();
});

App.use("/comments", commentRoute);
App.use(likeRoute);
App.use("/users", userRoute);
App.use("/auth", authRoute);
App.use("/posts", postRoute);

App.get("/", (_req, res, _next) => {
  res.status(201).json({ message: "Welcome to devTalk blog API" });
});

App.all("*", (req, _res, next) => {
  next(new AppErr(`Can't find ${req.originalUrl} on this server!`, 404));
});

App.use(globalErr);

module.exports = App;
