import React, { useState, useEffect } from "react";
import apiKeys from "./apiKeys";
import Clock from "react-live-clock";
import Forcast from "./forcast";
import loader from "./images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-open-weather";

const dateBuilder = (d) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
  color: "white",
  size: 112,
  animate: true,
};

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // by self
  let city = "mumbai";
  async function getdata() {
    let url = `${apiKeys.base}forecast?q=${city}&units=metric&APPID=${apiKeys.key}`;
    let data = await fetch(url);
    let output = await data.json();
    console.log(output);
    setWeatherData(output);
  }

  useEffect(() => {
    getdata();
  }, []);

  // till here

  
  const getPosition = (options) => {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  useEffect(() => {
    getWeather();
  }, []);

  const getWeather = async (lat, lon) => {
    try {
      const api_call = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await api_call.json();
      console.log(data);

      const main = data.weather[0].main;
      let icon = "CLEAR_DAY";
      switch (main) {
        case "Haze":
          icon = "CLEAR_DAY";
          break;
        case "Clouds":
          icon = "CLOUDY";
          break;
        case "Rain":
          icon = "RAIN";
          break;
        // Add other cases for different weather conditions
        default:
          icon = "CLEAR_DAY";
      }

      const newData = {
        lat: lat,
        lon: lon,
        city: data.name,
        temperatureC: Math.round(data.main.temp),
        temperatureF: Math.round(data.main.temp * 1.8 + 32),
        humidity: data.main.humidity,
        main: main,
        country: data.sys.country,
        icon: icon,
      };
      setWeatherData(newData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      getPosition()
        .then((position) => {
          getWeather(position.coords.latitude, position.coords.longitude);
        })
        .catch((err) => {
          getWeather(28.67, 77.22); // Default location
          alert(
            "You have disabled location service. Allow 'This APP' to access your location. Your current location will be used for calculating Real time weather."
          );
        });
    } else {
      alert("Geolocation not available");
    }

    const timerID = setInterval(() => {
      getWeather(weatherData.lat, weatherData.lon);
    }, 600000);

    return () => {
      clearInterval(timerID);
    };
  }, [weatherData.lat, weatherData.lon]);
  

  return <div></div>;

  
    <div>
      {isLoaded ? (
        <React.Fragment>
          <div className="city">
            <div className="title">
              <h2>{weatherData.city}</h2>
              <h3>{weatherData.country}</h3>
            </div>
            <div className="mb-icon">
              <ReactAnimatedWeather
                icon={weatherData.icon}
                color={defaults.color}
                size={defaults.size}
                animate={defaults.animate}
              />
              <p>{weatherData.main}</p>
            </div>
            <div className="date-time">
              <div className="dmy">
                <div id="txt"></div>
                <div className="current-time">
                  <Clock format="HH:mm:ss" interval={1000} ticking={true} />
                </div>
                <div className="current-date">{dateBuilder(new Date())}</div>
              </div>
              <div className="temperature">
                <p>
                  {weatherData.temperatureC}°<span>C</span>
                </p>
              </div>
            </div>
          </div>
          <Forcast icon={weatherData.icon} weather={weatherData.main} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <img src={loader} style={{ width: "50%", WebkitUserDrag: "none" }} />
          <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
            Detecting your location
          </h3>
          <h3 style={{ color: "white", marginTop: "10px" }}>
            Your current location will be displayed on the App
            <br />
            and used for calculating Real time weather.
          </h3>
        </React.Fragment>
      )}
    </div>
};

export default Weather;
