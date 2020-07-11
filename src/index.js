import "./styles.css";
import imgSearchService from "./functions/backgroundImgFunction";
import getWeather from "./functions/weatherFunction";
import currentWeather from "./templates/currentWeather.hbs";
import fiveDaysWeatherData from "./templates/fiveDaysWeather.hbs";
import sunsetDawn from "./templates/sunsetDawn.hbs";

let inputText = document.querySelector("#search-input");
let fiveDaysButton = document.querySelector(".five-days");
let todayButton = document.querySelector(".weather-today");
let formSubmit = document.querySelector("#search-form");
let weatherBlock = document.querySelector(".js-weather");

async function addBackgroundImage(city) {
    if (city) {
        city = `city+${city.name}`;
        const response = await imgSearchService(city);
        if (response.hits.length) {
            document.querySelector("body").style.backgroundImage = `url(${
        response.hits[getRandomArbitrary(0, response.hits.length)].largeImageURL
      })`;
        }
    }
}

function currentWeatherData(city) {
    return getWeather("weather", { q: city });
}

function fiveDaysWeather(lon, lat) {
    return getWeather("onecall", { lon: lon, lat: lat });
}

function getRandomArbitrary(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}

function success(pos) {
    let crd = pos.coords;
    getWeather("weather", {
        lat: crd.latitude,
        lon: crd.longitude,
    }).then((result) => {
        result.main.temp = parseInt(result.main.temp);
        result.main.temp_min = parseInt(result.main.temp_min);
        result.main.temp_max = parseInt(result.main.temp_max);
        addBackgroundImage(result);
        weatherBlock.innerHTML = currentWeather(result.main);
        inputText.value = result.name;
    });
}

navigator.geolocation.getCurrentPosition(success);

let search = async(event) => {
    event.preventDefault();
    if (inputText.value) {
        let result = await currentWeatherData(inputText.value);
        result.main.temp = parseInt(result.main.temp);
        result.main.temp_min = parseInt(result.main.temp_min);
        result.main.temp_max = parseInt(result.main.temp_max);
        addBackgroundImage(result);
        weatherBlock.innerHTML = currentWeather(result.main);
    } else {
        weatherBlock.innerHTML = "";
    }
};
let weatherButton = async(event) => {
    event.preventDefault();
    if (inputText.value) {
        let result = await currentWeatherData(inputText.value);
        result = await fiveDaysWeather(result.coord.lon, result.coord.lat);
        addBackgroundImage(result);
        const dailyWeather = result.daily.slice(0, 5);
        dailyWeather.map((value, index) => {
            const date = new Date(value.dt * 1000);
            dailyWeather[index].weekDay = date.toLocaleString("en", {
                weekday: "long",
            });
            dailyWeather[index].day = date.toLocaleString("en", {
                day: "numeric",
            });
            dailyWeather[index].month = date.toLocaleString("en", {
                month: "short",
            });
            dailyWeather[index].temp.min = parseInt(value.temp.min);
            dailyWeather[index].temp.max = parseInt(value.temp.max);
        });

        weatherBlock.innerHTML = fiveDaysWeatherData(dailyWeather);
    } else {
        weatherBlock.innerHTML = "";
    }
};

formSubmit.addEventListener("submit", search);
fiveDaysButton.addEventListener("click", weatherButton);
todayButton.addEventListener("click", search);