const express = require("express");
const bcrypt = require("bcrypt");
var uuid = require("uuid");
var admin = require("firebase-admin");

const app = express();
const port = 3001;

var cors = require("cors");
const { default: axios } = require("axios");

app.use(cors()); // Use this after the variable declaration
app.use(express.json());

var serviceAccount = require("./smart-drip-b2119-firebase-adminsdk-p406q-6660750f24.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://smart-drip-b2119-default-rtdb.europe-west1.firebasedatabase.app",
});
var db = admin.database();
var ref = db.ref();
ref.on("value", function (snapshot) {});

app.get("/", (req, res) => {
  res.send(`<h1 style="text-align: center">smart-drip-backend</h1>`);
});
app.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  console.log(req.body);
  ref
    .orderByChild("email")
    .equalTo(username)
    .on("child_added", (snapshot) => {
      console.log(snapshot.val());
      bcrypt.compare(password, snapshot.val().hash, function (err, result) {
        console.log(result); //TODO: check what to do with err param in order to give correct response code
        if (result) {
          return res.status(200).send(snapshot.val());
        } else {
          return res.status(406).send("Login not succesfull");
        }
      });
    });
  console.log("muie");
  // return res.status(404).send("Login not succesfull");
});
app.post("/signup", (req, res) => {
  let fname = req.body.fname;
  let lname = req.body.lname;
  let city = req.body.city;
  let address = req.body.address;
  let phonenumber = req.body.phonenumber;
  let email = req.body.email;
  let password = req.body.password;
  bcrypt.hash(password, 0, function (err, hash) {
    let entry = {
      fname: fname,
      lname: lname,
      city: city,
      address: address,
      phonenumber: phonenumber,
      email: email,
      hash: hash,
    };
    ref.child(uuid.v1()).set(entry);
    res.status(200).send(entry);
  });
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
