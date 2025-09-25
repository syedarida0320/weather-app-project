const { response } = require("../utils/response");
const getWeatherByCoords = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return response.badRequest(res, "Latitude and longitude are required");

    const WEATHER_API = process.env.WEATHER_API;
    const apiRes = await fetch(
      `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&hourly=apparent_temperature`
    );
    if (!apiRes.ok) {
      return response.serverError(res, "Weather API request failed", { status: apiRes.status });
    }
    const data = await apiRes.json();

    return response.ok( res, "Weather data fetched successfully by coordinates", data );
  } catch (error) {
    console.error("Weather API Error:", error.message);
    return response.serverError(res, "Failed to fetch weather by coordinates", error.message);
  }
};

// Get weather by city
const getWeatherByCity = async (req, res) => {
  try {
    const { name, count = 10} = req.query;
    if (!name) return response.badRequest(res, "City name is required");
    const GEOCODE_API = process.env.GEOCODE_API;
    const apiRes = await fetch(
      `${GEOCODE_API}?name=${encodeURIComponent(
        name
      )}&count=${count}&language=en&format=json`
    );

    if (!apiRes.ok) {
      return response.serverError(res, "Geocoding API request failed", { status: apiRes.status });
    }

    const data = await apiRes.json();
    return response.ok(res, "City weather data fetched successfully", data);
  } catch (error) {
    console.error("Geocoding API Error:", error.message);
    return response.serverError(res, "Failed to fetch city data", error.message);
  }
};

module.exports = {
  getWeatherByCoords,
  getWeatherByCity,
};
