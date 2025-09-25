import { useSelector } from "react-redux";
import { weather_codes } from "@/utils/weatherCodes";

export default function ForecastNextHours() {
  const forecast = useSelector((state) => state.forecast.forecast);

  const getWeatherIcon = (code) =>
    weather_codes[code]?.icons?.day || weather_codes[2]?.icons?.day;

  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="mt-5 md:mt-6">
      <h3 className="text-lg font-semibold mb-2">Next 72 Hours</h3>
      <div className="grid grid-cols-3 gap-2">
        {forecast.map((day, i) => {
          const weekday = new Date(day.date).toLocaleDateString("en-US", {
            weekday: "long",
          });
          return (
            <div key={i} className="bg-white/20 rounded-lg p-2 text-center">
              {day.code !== null && (
                <img
                  src={getWeatherIcon(day.code)}
                  alt="Weather icon"
                  className="w-12 h-12 mx-auto mb-1"
                />
              )}
              <p className="font-bold">
                {i === 0 ? "Today" : i === 1 ? "Tomorrow" : weekday}
              </p>
              <p>
                {Math.round(day.min)}° / {Math.round(day.max)}°
              </p>
              <p className="text-sm">
                {weather_codes[day.code]?.name || weather_codes[2]?.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
