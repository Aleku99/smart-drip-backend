const express = require("express");
var Gpio = require("onoff").Gpio;
var LED = new Gpio(17, "out");
var intervalID = 0; //TODO: fix intervalID reference error

function blinkLED() {
  //function to start blinking
  if (LED.readSync() === 0) {
    //check the pin state, if the state is 0 (or off)
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

app.get("/", (req, res) => {
  res.send(`<h1 style="text-align: center">smart-drip-backend</h1>`);
});

app.post("/change_config", (req, res) => {
  let chosen_config = req.body.mode;
  if (chosen_config == 0) {
    if (intervalID) {
      clearInterval(intervalID);
    }
    intervalID = setInterval(blinkLED, 250);
  } else if (chosen_config == 1) {
    if (intervalID) {
      clearInterval(intervalID);
    }
    intervalID = setInterval(blinkLED, 1000);
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
