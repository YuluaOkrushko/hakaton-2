import "./styles.css";
import imgSearchService from "./functions/backgroundImgFunction";
import getWeather from "./functions/weatherFunction";
import currentWeather from "./templates/currentWeather.hbs";
import fiveDaysWeatherData from "./templates/fiveDaysWeather.hbs";
import sunsetDawn from "./templates/sunsetDawn.hbs";
import favoriteCitiesTemplate from "./templates/favoriteCities.hbs";
import Chart from "chart.js";

let inputText = document.querySelector("#search-input");
let fiveDaysButton = document.querySelector(".five-days");
let todayButton = document.querySelector(".weather-today");
let formSubmit = document.querySelector("#search-form");
let weatherBlock = document.querySelector(".js-weather");

let clockInterval;
async function addBackgroundImage(weather) {
    if (weather) {
        const city = `city+${weather.name}`;
        const response = await imgSearchService(city);
        if (response.hits.length) {
            document.querySelector("body").style.backgroundImage = `url(${
        response.hits[getRandomArbitrary(0, response.hits.length)].largeImageURL
      })`;
        }
    }
}

function currentWeatherData(city) {
    city = city.trim();
    return getWeather("weather", { q: city });
}

function fiveDaysWeather(lon, lat) {
    return getWeather("onecall", { lon: lon, lat: lat });
}

function moreInfo(city) {
    city = city.trim();
    return getWeather("forecast", { q: city });
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
        weatherBlock.innerHTML = "";
        clearInterval(clockInterval);
        result.main.temp = parseInt(result.main.temp);
        result.main.temp_min = parseInt(result.main.temp_min);
        result.main.temp_max = parseInt(result.main.temp_max);
        result.iconUrl = prepareWeatherIconUrl(result.weather[0].icon, "@2x");
        addBackgroundImage(result);

        const date = new Date(result.dt * 1000);
        result.weekDay = date.toLocaleString("en", {
            weekday: "short",
        });
        result.day = date.toLocaleString("en", {
            day: "numeric",
        });
        result.month = date.toLocaleString("en", {
            month: "long",
        });
        let sunset = new Date(result.sys.sunset * 1000),
            sunrise = new Date(result.sys.sunrise * 1000);

        let sunsetH =
            sunset.getHours() < 10 ? "0" + sunset.getHours() : sunset.getHours();
        let sunsetM =
            sunset.getMinutes() < 10 ?
            "0" + sunset.getMinutes() :
            sunset.getMinutes();

        result.sunset = sunsetH + ":" + sunsetM;

        let sunriseH =
            sunrise.getHours() < 10 ? "0" + sunrise.getHours() : sunrise.getHours();
        let sunriseM =
            sunrise.getMinutes() < 10 ?
            "0" + sunrise.getMinutes() :
            sunrise.getMinutes();

        result.sunrise = sunriseH + ":" + sunriseM;
        weatherBlock.innerHTML = currentWeather(result);
        document.querySelector(".js-current-sunset").innerHTML = sunsetDawn(result);
        inputText.value = result.name;
        clockInterval = setInterval(clock, 500);
    });
}

let search = (event) => {
    event.preventDefault();
    event.stopPropagation();
    getWeatherByCity(inputText.value);
};

const getWeatherByCity = async(city) => {
    weatherBlock.innerHTML = "";
    clearInterval(clockInterval);
    city = city.trim();
    if (city) {
        let result = await currentWeatherData(city);
        result.main.temp = parseInt(result.main.temp);
        result.main.temp_min = parseInt(result.main.temp_min);
        result.main.temp_max = parseInt(result.main.temp_max);
        result.iconUrl = prepareWeatherIconUrl(result.weather[0].icon, "@2x");

        const date = new Date(result.dt * 1000);
        result.weekDay = date.toLocaleString("en", {
            weekday: "short",
        });
        result.day = date.toLocaleString("en", {
            day: "numeric",
        });
        result.month = date.toLocaleString("en", {
            month: "long",
        });
        let sunset = new Date(result.sys.sunset * 1000),
            sunrise = new Date(result.sys.sunrise * 1000);

        let sunsetH =
            sunset.getHours() < 10 ? "0" + sunset.getHours() : sunset.getHours();
        let sunsetM =
            sunset.getMinutes() < 10 ?
            "0" + sunset.getMinutes() :
            sunset.getMinutes();

        result.sunset = sunsetH + ":" + sunsetM;

        let sunriseH =
            sunrise.getHours() < 10 ? "0" + sunrise.getHours() : sunrise.getHours();
        let sunriseM =
            sunrise.getMinutes() < 10 ?
            "0" + sunrise.getMinutes() :
            sunrise.getMinutes();

        result.sunrise = sunriseH + ":" + sunriseM;
        addBackgroundImage(result);
        weatherBlock.innerHTML = currentWeather(result);
        document.querySelector(".js-current-sunset").innerHTML = sunsetDawn(result);
        clockInterval = setInterval(clock, 500);
    }
};
const weatherMoreInfo = async(city) => {
    let result = await moreInfo(city);
    let groups = {};
    result.list.forEach(function(val) {
        let date = val.dt_txt.split(" ")[0];
        if (date in groups) {
            groups[date].push(val);
        } else {
            groups[date] = new Array(val);
        }
    });
    delete groups[Object.keys(groups).shift()];
    let hourlyWeather = {};
    for (let prop in groups) {
        groups[prop].map((value) => {
            const date = new Date(value.dt * 1000);
            const timeOptions = { hour: "numeric", minute: "numeric", hour12: false };
            const time = new Intl.DateTimeFormat("en-AU", timeOptions).format(date);
            value.time = time;
            value.temp_min = parseInt(value.main.temp_min);
            value.temp_max = parseInt(value.main.temp_max);
            value.iconUrl = prepareWeatherIconUrl(value.weather[0].icon, "@2x");
            if (prop in hourlyWeather) {
                hourlyWeather[prop].push(value);
            } else {
                hourlyWeather[prop] = new Array(value);
            }
        });
    }
    return hourlyWeather;
};

let weatherButton = async(event) => {
    event.preventDefault();
    clearInterval(clockInterval);
    if (inputText.value) {
        let result = await currentWeatherData(inputText.value);
        result = await fiveDaysWeather(result.coord.lon, result.coord.lat);
        const dailyWeather = result.daily.slice(1, 6);
        const moreInfo = await weatherMoreInfo(inputText.value);
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
            dailyWeather[index].iconUrl = prepareWeatherIconUrl(
                value.weather[0].icon,
                "@2x"
            );
            dailyWeather[index].temp.min = parseInt(value.temp.min);
            dailyWeather[index].temp.max = parseInt(value.temp.max);

            dailyWeather[index].moreInfo = moreInfo[Object.keys(moreInfo)[index]];
        });

        addBackgroundImage(result);
        weatherBlock.innerHTML = fiveDaysWeatherData(dailyWeather);

        document.querySelectorAll(".js-more-info-btn").forEach((element) => {
            element.addEventListener("click", (event) => {
                let moreInfoBlock = event.target.nextElementSibling;
                if (moreInfoBlock.style.display == "none") {
                    moreInfoBlock.style.display = "block";
                } else {
                    moreInfoBlock.style.display = "none";
                }
            });
        });
        initCharts(dailyWeather);
    } else {
        weatherBlock.innerHTML = "";
    }
};

const clock = () => {
    const clockElement = document.querySelector(".js-clock");
    let now = new Date(),
        hours = now.getHours(),
        minutes = now.getMinutes(),
        seconds = now.getSeconds();
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
};
const prepareWeatherIconUrl = (icon, size = "") => {
    return "https://openweathermap.org/img/wn/" + icon + size + ".png";
};
const geolocationWeather = () => {
    navigator.geolocation.getCurrentPosition(success);
};
formSubmit.addEventListener("submit", search);
fiveDaysButton.addEventListener("click", weatherButton);
todayButton.addEventListener("click", search);

document
    .querySelector(".js-current-geolocation")
    .addEventListener("click", geolocationWeather);

document
    .querySelector(".js-save-to-favorites")
    .addEventListener("click", () => {
        if (inputText.value.trim()) {
            let favorites = window.localStorage.getItem("favorites");
            favorites = JSON.parse(favorites);
            if (!favorites) {
                favorites = new Array();
            }
            favorites.push(inputText.value.trim());
            window.localStorage.setItem("favorites", JSON.stringify(favorites));
            renderFavorites();
        }
    });

const renderFavorites = () => {
    let favorites = window.localStorage.getItem("favorites");
    favorites = JSON.parse(favorites);
    document.querySelector(
        ".favorite-wrapper"
    ).innerHTML = favoriteCitiesTemplate(favorites);

    document.querySelectorAll(".js-favorite-item").forEach((item) => {
        item.addEventListener("click", (event) => {
            inputText.value = event.target.text;
            getWeatherByCity(inputText.value);
        });
    });
    document.querySelectorAll(".js-remove-from-favorites").forEach((item) => {
        item.addEventListener("click", (event) => {
            let favorites = window.localStorage.getItem("favorites");
            favorites = JSON.parse(favorites);
            let index = favorites.indexOf(event.target.previousElementSibling.text);
            favorites.splice(index, 1);
            window.localStorage.setItem("favorites", JSON.stringify(favorites));
            renderFavorites();
        });
    });
};
renderFavorites();

const initCharts = (dailyWeather) => {
    document
        .querySelector(".js-show-chart")
        .addEventListener("click", (event) => {
            event.preventDefault();
            let chartBlock = document.querySelector(".chart-wrapper");
            if (chartBlock.style.display == "none") {
                chartBlock.style.display = "block";
                event.target.text = "Hide chart";
            } else {
                event.target.text = "Show chart";
                chartBlock.style.display = "none";
            }
        });

    let ctx = document.querySelector(".js-chart").getContext("2d");
    let labels = [];

    let temperatureData = [],
        humidityData = [],
        windSpeedData = [],
        pressureData = [];
    dailyWeather.map((item) => {
        labels.push(item.day + "," + item.month);
        temperatureData.push(item.temp.day);
        humidityData.push(item.humidity);
        windSpeedData.push(item.wind_speed);
        pressureData.push(item.pressure);
    });
    let datasets = [{
            label: "Temperature ",
            data: temperatureData,
            borderColor: "rgb(255, 207, 8)",
            fill: false,
            lineTension: 0,
        },
        {
            label: "Humidity, %",
            data: humidityData,
            borderColor: "rgb(9, 6, 234)",
            fill: false,
            lineTension: 0,
        },
        {
            label: "Wind Speed, m/s",
            data: windSpeedData,
            borderColor: "rgb(235, 155, 5)",
            fill: false,
            lineTension: 0,
        },
        {
            label: "Atmosphere Pressure m/m",
            data: pressureData,
            borderColor: "rgb(5, 120, 6)",
            fill: false,
            lineTension: 0,
        },
    ];

    let config = {
        type: "line",
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {},
    };
    let lineChart = new Chart(ctx, config);
};