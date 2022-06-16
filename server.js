const express = require("express");
const dotenv = require("dotenv").config({ path: ".env" });
var Gpio = require("onoff").Gpio;
var cors = require("cors");
var sensor = require("node-dht-sensor");
const { getDatabase, ref, get, child } = require("firebase/database");
const database = require("./firebase.js");

const app = express();
const port = 3001;
let LED = new Gpio(17, "out");
let intervalID = 0;
let irrigationActive = false;
let humidity_data = [];
let temperature_data = [];

app.use(cors());
app.use(express.json());

function startup() {
  LED.writeSync(1);
  getConfigurationFromDB();

  //read sensor data once at startup
  read_sensor_data();

  //set 1h temp/humidity reading interval
  setInterval(() => {
    read_sensor_data();
  }, 3600000); //read data every hour
}

function getConfigurationFromDB() {
  const dbRef = ref(getDatabase());
  get(child(dbRef, "users/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          if (child.val().usertoken === process.env.USER_TOKEN) {
            setStartConfiguration(child.val().config);
          }
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function setStartConfiguration(config) {
  console.log(config);
  if (config.mode == "0") {
    let hour = config.hour;
    let minutes = config.minutes;
    let duration = config.duration;
    let dates = config.dates;
    intervalID = setInterval(() => {
      let date = new Date();
      if (
        hour == date.getHours() &&
        minutes == date.getMinutes() &&
        checkDate(date, dates)
      ) {
        if (irrigationActive === false) {
          LED.writeSync(0);
          irrigationActive = true;
          setTimeout(() => {
            LED.writeSync(1);
          }, duration * 1000);
          setTimeout(() => {
            irrigationActive = false;
          }, 60000);
        }
      }
    }, 1000);
  } else if (config.mode == "1") {
    let interval = config.interval;
    let duration = config.duration;
    let dates = config.dates;
    let date = new Date();
    if (checkDate(date, dates)) {
      if (irrigationActive === false) {
        LED.writeSync(0);
        irrigationActive = true;
      }
      setTimeout(() => {
        LED.writeSync(1);
      }, duration * 1000);
      setTimeout(() => {
        irrigationActive = false;
      }, 60000);
    }

    intervalID = setInterval(() => {
      let date = new Date();
      if (checkDate(date, dates)) {
        if (irrigationActive === false) {
          LED.writeSync(0);
          irrigationActive = true;
        }
        setTimeout(() => {
          LED.writeSync(1);
        }, duration * 1000);
        setTimeout(() => {
          irrigationActive = false;
        }, 60000);
      }
    }, interval * 3600000);
  } else if (config.mode == "2") {
    intervalID = setInterval(() => {
      sensor.read(11, 15, function (err, temperature, humidity) {
        if (!err) {
          if (temperature >= 31 || humidity <= 39) {
            LED.writeSync(0);
          } else if (temperature <= 29 || humidity >= 41) {
            LED.writeSync(1);
          }
        } else {
          console.log(err);
        }
      });
    }, 1000);
  }
}

function read_sensor_data() {
  sensor.read(11, 15, function (err, temperature, humidity) {
    if (!err) {
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
function checkDate(date, dates) {
  let dateFound = false;
  if (dates == "daily") {
    dateFound = true;
  } else {
    dates.forEach((d) => {
      if (
        d.year == date.getFullYear() &&
        d.month == date.getMonth() + 1 &&
        d.day == date.getDate()
      ) {
        dateFound = true;
      }
    });
  }
  return dateFound;
}

startup();

app.get("/", (req, res) => {
  res.send(`<h1 style="text-align: center">smart-drip-backend</h1>`);
});

app.post(`/check_system`, (req, res) => {
  let { userToken } = req.body;
  console.log(userToken);
  console.log(process.env.USER_TOKEN);
  if (userToken === process.env.USER_TOKEN) {
    res.status(200).send("System found");
  } else {
    console.log(process.env.USER_TOKEN);
    console.log(userToken);
    res.status(401).send("System not found");
  }
});

app.post(`/change_config`, (req, res) => {
  let chosen_config = req.body.mode;
  if (chosen_config == 0) {
    if (intervalID) {
      clearInterval(intervalID);
      LED.writeSync(1);
      irrigationActive = false;
    }
    let hour = req.body.hour;
    let minutes = req.body.minutes;
    let duration = req.body.duration;
    let dates = req.body.dates;
    intervalID = setInterval(() => {
      let date = new Date();
      if (
        hour == date.getHours() &&
        minutes == date.getMinutes() &&
        checkDate(date, dates)
      ) {
        if (irrigationActive === false) {
          LED.writeSync(0);
          irrigationActive = true;
          setTimeout(() => {
            LED.writeSync(1);
          }, duration * 1000);
          setTimeout(() => {
            irrigationActive = false;
          }, 60000);
        }
      }
    }, 1000);
  } else if (chosen_config == 1) {
    if (intervalID) {
      clearInterval(intervalID);
      LED.writeSync(1);
      irrigationActive = false;
    }
    let interval = req.body.interval;
    let duration = req.body.duration;
    let dates = req.body.dates;
    let date = new Date();
    if (checkDate(date, dates)) {
      if (irrigationActive === false) {
        LED.writeSync(0);
        irrigationActive = true;
      }
      setTimeout(() => {
        LED.writeSync(1);
      }, duration * 1000);
      setTimeout(() => {
        irrigationActive = false;
      }, 60000);
    }

    intervalID = setInterval(() => {
      let date = new Date();
      if (checkDate(date, dates)) {
        if (irrigationActive === false) {
          LED.writeSync(0);
          irrigationActive = true;
        }
        setTimeout(() => {
          LED.writeSync(1);
        }, duration * 1000);
        setTimeout(() => {
          irrigationActive = false;
        }, 60000);
      }
    }, interval * 3600000);
  } else {
    if (intervalID) {
      clearInterval(intervalID);
      irrigationActive = false;
      LED.writeSync(1);
    }
    intervalID = setInterval(() => {
      sensor.read(11, 15, function (err, temperature, humidity) {
        if (!err) {
          if (temperature > 31 || humidity < 39) {
            LED.writeSync(0);
          } else if (temperature < 29 || humidity > 41) {
            LED.writeSync(1);
          }
        } else {
          console.log(err);
        }
      });
    }, 1000);
  }
  res.status(200).send("Success");
});

app.get(`/check_history`, (req, res) => {
  let data = {
    humidity_data: humidity_data,
    temperature_data: temperature_data,
  };
  res.status(200).send(data);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
