import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db, auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc, writeBatch, deleteDoc } from "firebase/firestore";

const GEOCODE_API = import.meta.env.VITE_GEOCODE_API;
const WEATHER_API = import.meta.env.VITE_WEATHER_API;

// Fetch weather by coordinates
export const fetchWeatherByCoords = createAsyncThunk(
  "forecast/fetchWeatherByCoords",
  async ({ latitude, longitude }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));
      dispatch(setShowSuggestions(false));
      dispatch(setSuggestions([]));

      const res = await fetch(
        `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&hourly=apparent_temperature`
      );
      const data = await res.json();

      if (!data.current_weather) return rejectWithValue("No weather data");

      dispatch(setTemperature(data.current_weather.temperature));
      dispatch(setFeelsLike(data.hourly?.apparent_temperature?.[0] ?? null));
      dispatch(setWind(`${data.current_weather.windspeed} km/h`));
      dispatch(setWeatherCode(data.current_weather.weathercode));

      dispatch(
        setForecast(
          (data.daily?.time || []).slice(0, 3).map((day, i) => ({
            date: day,
            min: data.daily.temperature_2m_min[i],
            max: data.daily.temperature_2m_max[i],
            code: data.daily.weathercode[i],
          }))
        )
      );
    } catch {
      return rejectWithValue("Failed to fetch weather data");
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch weather by city name
export const fetchCityWeatherByName = createAsyncThunk(
  "forecast/fetchCityWeatherByName",
  async (name, { dispatch }) => {
    try {
      dispatch(setShowSuggestions(false));
      dispatch(setSuggestions([]));
      dispatch(setCity(name));

      const res = await fetch(
        `${GEOCODE_API}?name=${encodeURIComponent(name)}&count=1`
      );
      const data = await res.json();
      if (data.results?.length > 0) {
        const c = data.results[0];
        await dispatch(
          fetchWeatherByCoords({ latitude: c.latitude, longitude: c.longitude })
        );
      }
    } catch (err) {
      console.error(err);
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      await signOut(auth);
      return true;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Set default city
export const setDefaultCity = createAsyncThunk(
  "forecast/setDefaultCity",
  async ({ cities, cityId }, { rejectWithValue }) => {
    try {
      const batch = writeBatch(db);
      cities.forEach((c) => {
        const ref = doc(db, "cities", c.id);
        batch.update(ref, { isDefault: c.id === cityId });
      });
      await batch.commit();
    } catch {
      return rejectWithValue("Error setting default city");
    }
  }
);

// Remove city
export const removeCity = createAsyncThunk(
  "forecast/removeCity",
  async (cityId, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, "cities", cityId));
    } catch {
      return rejectWithValue("Error removing city");
    }
  }
);

const forecastSlice = createSlice({
  name: "forecast",
  initialState: {
    city: "",
    debouncedCity: "",
    suggestions: [],
    showSuggestions: false,
    temperature: null,
    feelsLike: null,
    wind: null,
    weatherCode: null,
    forecast: [],
    loading: false,
    error: "",
    highlightedIndex: -1,
    cities: [],
    user: null,
  },
  reducers: {
    setCity: (state, action) => { state.city = action.payload; },
    setDebouncedCity: (state, action) => { state.debouncedCity = action.payload; },
    setSuggestions: (state, action) => { state.suggestions = action.payload; },
    setShowSuggestions: (state, action) => { state.showSuggestions = action.payload; },
    setTemperature: (state, action) => { state.temperature = action.payload; },
    setFeelsLike: (state, action) => { state.feelsLike = action.payload; },
    setWind: (state, action) => { state.wind = action.payload; },
    setWeatherCode: (state, action) => { state.weatherCode = action.payload; },
    setForecast: (state, action) => { state.forecast = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    setHighlightedIndex: (state, action) => { state.highlightedIndex = action.payload; },
    setCities: (state, action) => { state.cities = action.payload; },
    setUser: (state, action) => { state.user = action.payload; },
    hideSuggestions: (state) => { state.showSuggestions = false; },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => { state.user = null; });
  },
});

export const {
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
  setUser,
  hideSuggestions,
} = forecastSlice.actions;

export default forecastSlice.reducer;
