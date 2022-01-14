const express = require("express");
const bcrypt = require("bcrypt");
var uuid = require("uuid");
var admin = require("firebase-admin");
var Gpio = require('onoff').Gpio; 
var LED = new Gpio(17, 'out'); 
var intervalID = 0; //TODO: fix intervalID reference error

function blinkLED() { //function to start blinking
  if (LED.readSync() === 0) { //check the pin state, if the state is 0 (or off)
    LED.writeSync(1); //set pin state to 1 (turn LED on)
  } else {
    LED.writeSync(0); //set pin state to 0 (turn LED off)
  }
}



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
  let user_found = false;
  ref
    .orderByChild("email")
    .equalTo(username)
    .on("child_added", (snapshot) => {
      user_found = true;
      bcrypt.compare(password, snapshot.val().hash, function (err, result) {
        if (result) {
          return res.status(200).send(snapshot.val());
        } else {
          return res.status(401).send("Password not correct");
        }
      });
    });
  if (!user_found) {
    res.status(404).send("Username doesn't exist");
  }
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

app.post("/change_config",  (req,res)=>{
    let chosen_config =  req.body.mode;
    if(chosen_config == 0){
      if(intervalID){
        clearInterval(intervalID);
      }
      intervalID = setInterval(blinkLED, 250);
    }
    else if(chosen_config == 1){
      if(intervalID){
        clearInterval(intervalID);
      }
      intervalID = setInterval(blinkLED, 1000);
    }
    else{
      if(intervalID){
        clearInterval(intervalID);
      }
      LED.writeSync(0);
    }
  })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


