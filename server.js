const express = require("express");
const dotenv = require("dotenv").config();
var Gpio = require("onoff").Gpio;
var cors = require("cors");
var sensor = require("node-dht-sensor");

const app = express();
const port = 3001;
let LED = new Gpio(17, "out");
let intervalID = 0;
let humidity_data = [];
let temperature_data = [];

const { default: axios } = require("axios");

app.use(cors()); // Use this after the variable declaration
app.use(express.json());

function read_sensor_data() {
  sensor.read(11, 15, function (err, temperature, humidity) {
    if (!err) {
      console.log(
        `temp: ${temperature} degrees celsius, humidity: ${humidity}%`
      );
      if (humidity_data.length == 775 || temperature_data.length == 775) {
        humidity_data.shift();
        temperature_data.shift();
        humidity_data.push(humidity);
        temperature_data.push(temperature);
      } else {
        humidity_data.push(humidity);
        temperature_data.push(temperature);
      }
    } else {
      console.log(err);
    }
  });
}

app.get("/", (req, res) => {
  res.send(`<h1 style="text-align: center">smart-drip-backend</h1>`);
});

app.get(`/${process.env.USER_TOKEN}`, (req, res) => {
  res.status(200).send("System found");
});

app.post(`/change_config/${process.env.USER_TOKEN}`, (req, res) => {
  let chosen_config = req.body.mode;
  if (chosen_config == 0) {
    if (intervalID) {
      clearInterval(intervalID);
    }
    let hour = req.body.hour;
    let minutes = req.body.minutes;
    let duration = req.body.duration;
    intervalID = setInterval(() => {
      let date = new Date();
      if (hour == date.getHours() && minutes == date.getMinutes()) {
        LED.writeSync(1);
        setTimeout(() => {
          LED.writeSync(0);
        }, duration * 1000);
      } else {
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
    }, interval * 3600000);
  } else {
    if (intervalID) {
      clearInterval(intervalID);
    }
    intervalID = setInterval(() => {
      sensor.read(11, 15, function (err, temperature, humidity) {
        if (!err) {
          if (temperature > 30 || humidity < 40) {
            LED.writeSync(1);
            setTimeout(() => {
              LED.writeSync(0);
            }, 5000);
          }
        } else {
          console.log(err);
        }
      });
    }, 60000);
  }
  res.status(200).send("Success");
});

app.get(`/check_history/${process.env.USER_TOKEN}`, (req, res) => {
  let data = {
    humidity_data: humidity_data,
    temperature_data: temperature_data,
  };
  res.status(200).send(data);
});

read_sensor_data();
setInterval(() => {
  read_sensor_data();
}, 3600000); //read data every hour

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
