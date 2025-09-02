import { useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, writeBatch, deleteDoc } from "firebase/firestore";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import bgImage from "../assets/bg.webp";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Menu } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { weather_codes } from "@/utils/weatherCodes";
import { useSelector, useDispatch } from "react-redux";
import {
  setCity,
  setDebouncedCity,
  setSuggestions,
  setShowSuggestions,
  setTemperature,
  setFeelsLike,
  setWind,
  setWeatherCode,
  setForecast,
  setLoading,
  setError,
  setHighlightedIndex,
  setCities,
  setSidebarOpen,
} from "@/store/forecastSlice";

const GEOCODE_API = import.meta.env.VITE_GEOCODE_API;
const WEATHER_API = import.meta.env.VITE_WEATHER_API;

export default function Forecast() {
  const {
    city,
    debouncedCity,
    suggestions,
    showSuggestions,
    temperature,
    feelsLike,
    wind,
    weatherCode,
    forecast,
    loading,
    error,
    highlightedIndex,
    cities,
    sidebarOpen,
  } = useSelector((state) => state.forecast);

  const dispatch = useDispatch();
  const skipFetchRef = useRef(false);
  const [user, authLoading] = useAuthState(auth);

  // ✅ Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setDebouncedCity(city));
    }, 500);
    return () => clearTimeout(handler);
  }, [city, dispatch]);

  // ✅ Fetch suggestions
  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      dispatch(setShowSuggestions(false));
      dispatch(setSuggestions([]));
      return;
    }
    if (debouncedCity.length < 1) {
      dispatch(setSuggestions([]));
      dispatch(setShowSuggestions(false));
      return;
    }
    async function fetchSuggestions() {
      try {
        const res = await fetch(
          `${GEOCODE_API}?name=${encodeURIComponent(debouncedCity)}&count=10`
        );
        const data = await res.json();
        if (data.results) {
          const unique = Array.from(
            new Map(
              data.results.map((s) => [`${s.name},${s.country}`, s])
            ).values()
          );
          dispatch(setSuggestions(unique));
          dispatch(setShowSuggestions(true));
        }
      } catch {
        dispatch(setSuggestions([]));
        dispatch(setShowSuggestions(false));
      }
    }
    fetchSuggestions();
  }, [debouncedCity, dispatch]);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  async function fetchWeatherByCoords(latitude, longitude) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));
      dispatch(setShowSuggestions(false));
      dispatch(setSuggestions([]));

      const weatherRes = await fetch(
        `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&hourly=apparent_temperature`
      );
      const weatherData = await weatherRes.json();
      if (!weatherData.current_weather) {
        dispatch(setError("No weather data available."));
        return;
      }
      const code = weatherData.current_weather.weathercode;
      dispatch(setTemperature(weatherData.current_weather.temperature));
      dispatch(
        setFeelsLike(weatherData.hourly?.apparent_temperature?.[0] ?? null)
      );
      dispatch(setWind(`${weatherData.current_weather.windspeed} km/h`));
      dispatch(setWeatherCode(code));
      dispatch(
        setForecast(
          (weatherData.daily?.time || []).slice(0, 3).map((day, i) => ({
            date: day,
            min: weatherData.daily.temperature_2m_min[i],
            max: weatherData.daily.temperature_2m_max[i],
            code: weatherData.daily.weathercode[i],
          }))
        )
      );
    } catch (err) {
      console.error(err);
      dispatch(setError("Failed to fetch weather data."));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function fetchCityWeatherByName(name) {
    try {
      skipFetchRef.current = true;
      dispatch(setShowSuggestions(false));
      dispatch(setSuggestions([]));
      dispatch(setCity(name));

      const res = await fetch(
        `${GEOCODE_API}?name=${encodeURIComponent(name)}&count=1`
      );
      const data = await res.json();
      if (data.results?.length > 0) {
        const c = data.results[0];
        fetchWeatherByCoords(c.latitude, c.longitude);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddCity() {
    if (!city || !user) return;
    try {
      const q1 = query(
        collection(db, "cities"),
        where("userId", "==", user.uid),
        where("name", "==", city)
      );
      const snapshot = await getDocs(q1);
      if (!snapshot.empty) {
        console.log("City already exists in saved list");
        dispatch(setError("City is already in your saved list."));
        return;
      }

      const q2 = query(
        collection(db, "cities"),
        where("userId", "==", user.uid)
      );
      const allCitiesSnap = await getDocs(q2);
      const isFirstCity = allCitiesSnap.empty;

      await addDoc(collection(db, "cities"), {
        name: city,
        createdAt: serverTimestamp(),
        userId: user.uid,
        isDefault: isFirstCity,
      });

      dispatch(setCity(""));
      dispatch(setError(""));
    } catch (err) {
      console.error("Error adding city:", err);
      dispatch(setError("Failed to save city"));
    }
  }

  async function handleSetDefaultCity(cityId) {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      cities.forEach((c) => {
        const ref = doc(db, "cities", c.id);
        batch.update(ref, { isDefault: c.id === cityId });
      });
      await batch.commit();
      console.log("Default city updated.");
    } catch (err) {
      console.error("Error setting default city:", err);
    }
  }

  async function handleRemoveCity(cityId) {
    try {
      await deleteDoc(doc(db, "cities", cityId));
      console.log("City removed successfully");
    } catch (err) {
      console.error("Error removing city:", err);
    }
  }

  useEffect(() => {
    if (!user || cities.length === 0) return;
    const defaultCity = cities.find((c) => c.isDefault);
    if (defaultCity) {
      fetchCityWeatherByName(defaultCity.name);
    }
  }, [user, cities]);


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      dispatch(setCities([]));
      return;
    }

    const q = query(
      collection(db, "cities"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cityList = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          // 🔧 Convert Firestore Timestamp -> serializable value for Redux
          let createdAt = null;
          if (data.createdAt instanceof Timestamp) {
            createdAt = data.createdAt.toMillis();
          } else if (
            typeof data.createdAt === "number" ||
            typeof data.createdAt === "string"
          ) {
            createdAt = data.createdAt;
          }

          return {
            id: docSnap.id,
            ...data,
            createdAt,
          };
        });

        dispatch(setCities(cityList.reverse()));
      },
      (err) => console.error("onSnapshot error:", err)
    );

    return () => unsubscribe();
  }, [user, authLoading, dispatch]);

  // Clear suggestions when we have a temperature
  useEffect(() => {
    if (temperature !== null) {
      dispatch(setShowSuggestions(false));
      dispatch(setSuggestions([]));
    }
  }, [temperature, dispatch]);

  function handleSelectSuggestion(suggestion) {
    skipFetchRef.current = true;
    dispatch(setCity(suggestion.name));
    dispatch(setSuggestions([]));
    dispatch(setHighlightedIndex(-1));
    dispatch(setShowSuggestions(false));
    fetchWeatherByCoords(suggestion.latitude, suggestion.longitude);
  }

  function handleKeyDown(e) {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      dispatch(
        setHighlightedIndex(
          highlightedIndex < suggestions.length - 1 ? highlightedIndex + 1 : 0
        )
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      dispatch(
        setHighlightedIndex(
          highlightedIndex > 0 ? highlightedIndex - 1 : suggestions.length - 1
        )
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex]);
    }
  }

  const getWeatherIcon = (code) =>
    weather_codes[code]?.icons.day || weather_codes[2]?.icons?.day;

  return (
    <div
      className="h-screen w-full bg-cover bg-center relative flex"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Hamburger button only on mobile */}
      <button
        className="absolute top-4 left-4 md:hidden z-50 p-2 bg-black/60 rounded-[7px]"
        onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Sidebar */}
      <div
        className={`w-full md:w-64 bg-black md:bg-black/60 text-white p-4 overflow-y-auto 
        transform transition-transform duration-300
        fixed top-0 left-0 h-full z-40
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:static md:translate-x-0`}
      >
        <h2 className="text-xl md:p-0 pt-[70px] font-bold mb-5">
          Saved Cities
        </h2>
        {cities.length === 0 ? (
          <p className="text-gray-300">No cities added yet.</p>
        ) : (
          <ul className="space-y-1">
            {cities.map((c) => (
              <li
                key={c.id}
                className={`cursor-pointer rounded px-2 py-1 flex justify-between items-center 
        ${c.isDefault ? "bg-gray-700 text-white" : "hover:bg-white/10"}`}
                onClick={() => fetchCityWeatherByName(c.name)}
              >
                <span>{c.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs px-2 py-0.5 rounded hover:bg-gray-500"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent triggering fetch
                      handleSetDefaultCity(c.id);
                    }}
                  >
                    {c.isDefault ? "Default" : "Set Default"}
                  </button>
                  <button
                    className="p-1 hover:bg-white rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCity(c.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1 flex items-center justify-start md:pl-20">
        <div className="absolute top-4 right-4">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="px-6 md:px-4 py-4 md:py-2 bg-black"
          >
            Logout
          </Button>
        </div>

        <Card className="w-full md:my-[50px] md:mx-[100px] mx-[20px] my-[50px] max-w-md bg-gradient-to-b from-black/50 via-black/40 to-black/50 backdrop-blur-md text-white shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-center md:text-3xl text-2xl font-bold">
              Weather App
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="relative mb-4 md:mb-6">
              <Input
                type="text"
                placeholder="Search city..."
                value={city}
                onChange={(e) => {
                  dispatch(setCity(e.target.value));      // 🔧 make input editable
                  dispatch(setTemperature(null));          // 🔧 match original behavior
                }}
                onKeyDown={handleKeyDown}
                className="bg-white text-black pr-10 md:pr-12 rounded-lg"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={handleAddCity}
                className="absolute inset-y-0 hover:bg-blue-100 right-0 mr-1"
              >
                <Plus className="w-4 h-4" />
              </Button>

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute w-full bg-white shadow-md rounded mt-1 z-10 max-h-30 md:max-h-40 overflow-y-auto">
                  {suggestions.map((sug, i) => (
                    <li
                      key={`${sug.id ?? `${sug.name}-${sug.country}`}`}
                      className={`p-2 hover:bg-gray-200 cursor-pointer text-black ${
                        i === highlightedIndex ? "bg-gray-300" : ""
                      }`}
                      onMouseDown={() => handleSelectSuggestion(sug)}
                    >
                      {sug.name}, {sug.country}
                    </li>
                  ))}
                </ul>
              )}

              {loading && (
                <div className="flex justify-center mt-4">
                  <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin border-solid"></div>
                </div>
              )}
            </div>

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

            {forecast.length > 0 && (
              <div className="mt-5 md:mt-6">
                <h3 className="text-lg font-semibold mb-2">Next 72 Hours</h3>
                <div className="grid grid-cols-3 gap-2">
                  {forecast.map((day, i) => {
                    const weekday = new Date(day.date).toLocaleDateString(
                      "en-US",
                      { weekday: "long" }
                    );
                    return (
                      <div
                        key={i}
                        className="bg-white/20 rounded-lg p-2 text-center"
                      >
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
                          {weather_codes[day.code]?.name ||
                            weather_codes[2]?.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
