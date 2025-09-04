import { useSelector } from "react-redux";
import { getWeatherIcon, weather_codes } from "../utils/weatherCodes";

export default function WeatherInfo() {
  const { error, temperature, loading, weatherCode, feelsLike, wind } =
    useSelector((state) => state.forecast);

  return (
    <div className="text-center md:min-h-[120px] flex flex-col items-center justify-center">
      {error && <p className="text-red-400">{error}</p>}

      {temperature !== null && !loading && !error && (
        <>
          {weatherCode !== null && (
            <img
              src={getWeatherIcon(weatherCode)}
              alt="Weather icon"
              className="w-30 h-30 mb-1 md:mb-2"
            />
          )}
          <h2 className="text-5xl font-bold mb-2">{temperature}°C</h2>
          <p className="text-lg">
            {weather_codes[weatherCode]?.name || weather_codes[2]?.name}
          </p>
          <p className="md:text-sm">
            Feels like {feelsLike}° Wind {wind}
          </p>
        </>
      )}

      {!temperature && !loading && !error && (
        <p className="text-gray-300">Search for a country or region</p>
      )}
    </div>
  );
}
