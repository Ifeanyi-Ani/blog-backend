const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const AppErr = require("./utils/appErr");

require("dotenv").config();

const {
  APIKEY,
  AUTHDOMAIN,
  STORAGEBUCKET,
  MESSAGINGSENDERID,
  APPID,
  MEASUREMENTID,
  PROJECTID,
} = process.env;

const firebaseConfig = {
  apiKey: APIKEY,
  authDomain: AUTHDOMAIN,
  projectId: PROJECTID,
  storageBucket: STORAGEBUCKET,
  messagingSenderId: MESSAGINGSENDERID,
  appId: APPID,
  measurementId: MEASUREMENTID,
};

let app;
let fireStoreDb;

const initializeFirebaseApp = () => {
  try {
    app = initializeApp(firebaseConfig);
    fireStoreDb = getFirestore();
    return app;
  } catch (error) {
    return new AppErr("firebase-initializeFirebaseApp", 500);
  }
};

const getFirebaseApp = () => app;

module.exports = {
  initializeFirebaseApp,
  getFirebaseApp,
};
