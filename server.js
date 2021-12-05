const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const port = 3001;

var cors = require("cors");
const { default: axios } = require("axios");

app.use(cors()); // Use this after the variable declaration
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`<h1 style="text-align: center">smart-drip-backend</h1>`);
});
app.post("/login", (req, res) => {
  res.send("Got a POST request from login screen");
});
app.post("/signup", (req, res) => {
  console.log(req.body);
  let fname = req.body.fname;
  let lname = req.body.lname;
  let city = req.body.city;
  let address = req.body.address;
  let phonenumber = req.body.phonenumber;
  let email = req.body.email;
  let password = req.body.password;
  bcrypt.hash(password, 5, function (err, hash) {
    let entry = {
      fname: fname,
      lname: lname,
      city: city,
      address: address,
      phonenumber: phonenumber,
      email: email,
      hash: hash,
    };
    axios.post(
      "https://smart-drip-b2119-default-rtdb.europe-west1.firebasedatabase.app/.json",
      entry
    );
  });
  res.send("Signup successfull");
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
