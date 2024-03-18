document.addEventListener("DOMContentLoaded", function() {
    fetchWeather();
    document.getElementById("submit_button").onclick = fetchWeather;
});


    async function fetchWeather() {
        const city = document.getElementById("city").value;

        try {
            if (city === "") {
                return; // Stop execution if city is not selected
            }

            const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=50afa3cbd4cb4dda83f71151241103&q=${city}&aqi=no&days=5`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Extract relevant weather information from the API response
            const location = `${data.location.name}, ${data.location.region}, ${data.location.country}`;
            const time = data.location.localtime;
            const temperature = `${data.current.temp_c}°C`;
            const condition = data.current.condition.text;
            const wind = data.current.wind_kph;
            const humidity = data.current.humidity;
            const weather_icon = data.current.condition.icon;

            // Extracting days for forecast
            const temp_arr = [];
            const date_arr = [];
            const weather_icon_arr =[];

            for (let i = 0; i < 3; i++) {
                const date = data.forecast.forecastday[i].date.slice(-2);
                date_arr.push(date);

                const temp = data.forecast.forecastday[i].day.avgtemp_c;
                temp_arr.push(temp);

                const weather_icons = data.forecast.forecastday[i].day.condition.icon;
                weather_icon_arr.push(weather_icons);
            }

            // Display weather information on the webpage
            document.querySelector(".location").innerHTML = location;
            document.querySelector(".local_time").innerHTML = time;
            document.getElementById("weather_icon_day1").src = weather_icon;
            document.getElementById("current_temp_day1").innerHTML = temperature;
            document.getElementById("weather_condition_day1").innerHTML = condition;
            document.querySelector(".wind").innerHTML = `Wind: ${wind}kph`;
            document.querySelector(".humidity").innerHTML = `Humidity: ${humidity}`;

            for (let i = 1; i < 3; i++) {
                document.getElementById(`weather_icon_day${i+1}`).src = weather_icon_arr[i];
                document.getElementById(`current_temp_day${i+1}`).innerHTML = temp_arr[i];
                document.getElementById(`date${i+1}`).innerHTML = date_arr[i];
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

