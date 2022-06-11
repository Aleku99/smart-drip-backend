const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyBgMUU94MW75z9gIXMG_rWTuJixKgZRQeE",
  authDomain: "smart-drip-b2119.firebaseapp.com",
  databaseURL:
    "https://smart-drip-b2119-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "smart-drip-b2119",
  storageBucket: "smart-drip-b2119.appspot.com",
  messagingSenderId: "461645107712",
  appId: "1:461645107712:web:8c2d0488e197295754fee5",
  measurementId: "G-EJGJM2Y6JL",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export default database;
