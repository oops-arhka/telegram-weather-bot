const request = require("request");
const API_KEY = "YOUR KEY";

module.exports = {
  byName: function(ctx, name) {
    const NAME_URL = "http://api.openweathermap.org/data/2.5/weather?q=";
    request(`${NAME_URL}${name}&APPID=${API_KEY}`, (err, res, body) => {
      this.weatherRequest(ctx, err, res, body);
    });
  },
  byLocation: function(ctx, location) {
    const url = `http://api.openweathermap.org/data/2.5/weather?lat=${
      location.latitude
    }&lon=${location.longitude}&APPID=${API_KEY}`;
    request(url, (err, res, body) => {
      this.weatherRequest(ctx, err, res, body);
    });
  },
  byZip: function(ctx, zip, country) {
    let url;
    if (country === "" || country === undefined) {
      url = `http://api.openweathermap.org/data/2.5/weather?zip=${zip}&APPID=${API_KEY}`;
    } else {
      country = country.toLowerCase();
      url = `http://api.openweathermap.org/data/2.5/weather?zip=${zip},${country}&APPID=${API_KEY}`;
    }
    request(url, (err, res, body) => {
      this.weatherRequest(ctx, err, res, body);
    });
  },
  kelvinToC: function(kelvin) {
    return Math.floor(kelvin - 273.15);
  },
  kelvinToF: function(kelvin) {
    return Math.floor(kelvin * (9 / 5) - 459.67);
  },
  weatherRequest: function(ctx, err, res, body) {
    // If there is an error requesting.
    if (err) {
      console.error(err);
      ctx.reply(err);
      return err;
    }

    // If there is an erroronious status code response.
    if (res.statusCode !== 200) {
      console.error(err);
      ctx.reply(`I can't find the weather for that location.`);
      return res.statusCode;
    }

    // Just in case it's not a JSON.
    const parsedBody = JSON.parse(body);

    // If there is no city found or 404.
    if (parsedBody.cod === "404") {
      ctx.reply(parsedBody.message);
      return parsedBody.message;
    }

    // Weather Description and Emoji
    let weatherDesc;
    let emoji;
    if (parsedBody.weather[0] && parsedBody.weather[0].description) {
      weatherDesc = parsedBody.weather[0].description;
      emoji = this.findEmoji(weatherDesc);
    }

    // City Name
    let city;
    if (parsedBody.name) {
      city = parsedBody.name;
    }

    // Temp F/C
    let tempF;
    let tempC;
    if (parsedBody.main && parsedBody.main.temp) {
      tempF = this.kelvinToF(parsedBody.main.temp);
      tempC = this.kelvinToC(parsedBody.main.temp);
    }

    // The response.
    let response = `The weather in ${city} is currently ${tempF}°F / ${tempC}°C and ${emoji} ${weatherDesc}.`;

    ctx.reply(response);
  },
  findEmoji: function(desc) {
    switch (desc) {
      case "broken clouds":
        return "⛅";
        break;

      case "heavy intensity rain":
        return "🌧";
        break;

      case "scattered clouds":
        return "⛅";
        break;

      case "overcast clouds":
        return "☁";
        break;

      case "light intensity drizzle":
        return "🌧";
        break;

      case "light intensity shower rain":
        return "🌧";
        break;

      case "moderate rain":
        return "🌧";
        break;

      case "fog":
        return "🌫";
        break;

      // There is no 'mist' emoji, only fog.
      case "mist":
        return "🌫";
        break;

      case "clear sky":
        return "☀";
        break;

      // TODO: Replace snow with real desc
      case "snow":
        return "🌨";
        break;

      case "light snow":
        return "🌨";
        break;

      // TODO: Replace thunderstorm with real desc
      case "thunderstorm":
        return "🌩";
        break;

      default:
        return "☀";
        break;
    }
  }
};
