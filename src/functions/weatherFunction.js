export default function getWeather(method, params = {}) {
    const baseApiUrl = "https://api.openweathermap.org/data/2.5/";
    const url = new URL(baseApiUrl + method);
    params.units = "metric";
    params.appid = "d2e4759712b1aa2779c0cb79fc29cf62";

    url.search = new URLSearchParams(params).toString();
    return fetch(url.toString(), {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                return false;
            }
        })
        .catch((error) => {
            console.log(error);
        });
}