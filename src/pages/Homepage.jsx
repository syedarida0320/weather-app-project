import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchWeather } from "@/store/weatherSlice"; 
import { weather_codes } from "@/utils/weatherCodes";
import bgImage from "../assets/bg.webp";

export default function Homepage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { todayWeather, loading, error } = useSelector(
    (state) => state.weather
  );

useEffect(() => {
    dispatch(fetchWeather());
  }, [dispatch]);

  // ✅ helper to get correct icon and label
  function getWeatherInfo(code) {
    if (!code || !weather_codes[code]) return null;
    return weather_codes[code];
  }

  const info = todayWeather ? getWeatherInfo(todayWeather.weathercode) : null;

  return (
    <div
      className="h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full flex justify-end gap-4 p-4 bg-black/40 backdrop-blur-sm">
        <Button variant="secondary" onClick={() => navigate("/login")}>
          Login
        </Button>
        <Button variant="secondary" onClick={() => navigate("/register")}>
          Sign Up
        </Button>
      </nav>

      {/* Weather Card */}
      <div className="h-full flex items-center justify-center">
        <Card className="w-full md:m-0 mx-[20px] max-w-md bg-black/60 text-white p-6 rounded-2xl backdrop-blur-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl md:text-3xl font-bold">
              Weather Today
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center">
            {loading && <p>Loading current weather...</p>}
            {error && <p className="text-red-400">{error}</p>}
            {todayWeather && !loading && !error && (
              <>
                {info && (
                  <div className="flex justify-center items-center mb-4">
                    <img
                      src={info.icons.day}
                      alt={info.name}
                      className=" w-50 h-50"
                    />
                  </div>
                )}
                <h2 className="text-5xl md:text-6xl font-bold mb-2">
                  {todayWeather.temperature}°C
                </h2>
                <p className="text-lg">
                  {info?.name} • Wind {todayWeather.windspeed} km/h
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
