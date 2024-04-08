const AppErr = require("../utils/appErr");
const allowedOrigin = require("./allowedOrigin");

const corOptions = {
  origin: (origin, callback) => {
    if (allowedOrigin.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new AppErr("Not allowed by cors", 403));
    }
  },
  optionsSuccessStatus: 200,
};

module.exports = corOptions;
