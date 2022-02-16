const express = require("express");
var Gpio = require("onoff").Gpio;
var LED = new Gpio(17, "out");
var intervalID = 0; //TODO: fix intervalID reference error

const app = express();
const port = 3001;

var cors = require("cors");
const { default: axios } = require("axios");

app.use(cors()); // Use this after the variable declaration
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`<h1 style="text-align: center">smart-drip-backend</h1>`);
});

app.post("/change_config", (req, res) => {
  let chosen_config = req.body.mode;
  if (chosen_config == 0) {
    if (intervalID) {
      clearInterval(intervalID);
    }
    let hour = req.body.hour;
    let minutes = req.body.minutes;
    let duration = req.body.duration;
    let date = new Date();
    intervalID = setInterval(() => {
      if (hour == date.getHours() && minutes == date.getMinutes()) {
        console.log("Time is nigh");
        LED.writeSync(1);
        setTimeout(() => {
          LED.writeSync(0);
        }, duration * 1000);
      } else {
        console.log("Time is not nigh");
      }
    }, 60000);
  } else if (chosen_config == 1) {
    if (intervalID) {
      clearInterval(intervalID);
    }
    let interval = req.body.interval;
    let duration = req.body.duration;
    intervalID = setInterval(() => {
      LED.writeSync(1);
      setTimeout(() => {
        LED.writeSync(0);
      }, duration * 1000);
    }, interval * 1000);
  } else {
    if (intervalID) {
      clearInterval(intervalID);
    }
    LED.writeSync(0);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
