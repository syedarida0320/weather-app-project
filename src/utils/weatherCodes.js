import clearDay from "../assets/clear.svg";
import clearNight from "../assets/clear-night.svg";
import partlyCloudyDay from "../assets/partly-cloudy.svg";
import partlyCloudyNight from "../assets/partly-cloudy-night.svg";
import overcast from "../assets/overcast.svg";
import fog from "../assets/fog.svg";
import fogNight from "../assets/fog-night.svg";
import rimeFog from "../assets/rime-fog.svg";
import lightDrizzle from "../assets/light-drizzle.svg";
import rainShowers from "../assets/rain-showers.svg";
import rain from "../assets/rain.svg";
import heavyRain from "../assets/heavy-rain.svg";
import snow from "../assets/snow.svg";
import thunderstorm from "../assets/thunderstorm.svg";
import snowGrains from "../assets/snow-grains.svg";
import lightSnowShowers from "../assets/light-snow-showers.svg";
import heavySnowShowers from "../assets/heavy-snow-showers.svg";

export const weather_codes = {
  0: { name: "Clear", icons: { day: clearDay, night: clearNight } },
  1: { name: "Mainly clear", icons: { day: clearDay, night: clearNight } },
  2: {
    name: "Partly cloudy",
    icons: { day: partlyCloudyDay, night: partlyCloudyNight },
  },
  3: { name: "Overcast", icons: { day: overcast, night: overcast } },
  45: { name: "Fog", icons: { day: fog, night: fogNight } },
  48: { name: "Depositing rime fog", icons: { day: rimeFog, night: rimeFog } },
  51: {
    name: "Light drizzle",
    icons: { day: lightDrizzle, night: lightDrizzle },
  },
  53: {
    name: "Moderate drizzle",
    icons: { day: lightDrizzle, night: lightDrizzle },
  },
  55: {
    name: "Dense drizzle",
    icons: { day: lightDrizzle, night: lightDrizzle },
  },
  61: { name: "Slight rain", icons: { day: rainShowers, night: rainShowers } },
  63: { name: "Rain", icons: { day: rain, night: rain } },
  65: { name: "Heavy rain", icons: { day: heavyRain, night: heavyRain } },
  71: { name: "Slight snow fall", icons: { day: snow, night: snow } },
  73: { name: "Moderate snow fall", icons: { day: snow, night: snow } },
  75: { name: "Heavy snow fall", icons: { day: snow, night: snow } },
  77: { name: "Snow grains", icons: { day: snowGrains, night: snowGrains } },
  80: { name: "Rain showers", icons: { day: rainShowers, night: rainShowers } },
  81: {
    name: "Heavy rain showers",
    icons: { day: heavyRain, night: heavyRain },
  },
  82: {
    name: "Heavy rain showers",
    icons: { day: heavyRain, night: heavyRain },
  },
  85: {
    name: "Light snow showers",
    icons: { day: lightSnowShowers, night: lightSnowShowers },
  },
  86: {
    name: "Heavy snow showers",
    icons: { day: heavySnowShowers, night: heavySnowShowers },
  },
  95: {
    name: "Thunderstorm",
    icons: { day: thunderstorm, night: thunderstorm },
  },
  96: {
    name: "Thunderstorm",
    icons: { day: thunderstorm, night: thunderstorm },
  },
  99: {
    name: "Thunderstorm",
    icons: { day: thunderstorm, night: thunderstorm },
  },
};
export function getWeatherIcon(code, isDay = true) {
  const entry = weather_codes[code];
  if (!entry) return clearDay; // fallback to clearDay
  return isDay ? entry.icons.day : entry.icons.night;
}