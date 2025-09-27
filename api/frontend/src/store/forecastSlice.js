import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/utils/axios";

export const fetchCities = createAsyncThunk(
  "forecast/fetchCities",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("Unauthorized");

      const res = await axios.get("/cities");

      if (!res.data.success) return rejectWithValue(res.data.message);

      // server returns array of cities
      return res.data.data || [];
    } catch (err) {
      if (err.response?.status !== 401)
        console.error("Fetch cities error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch cities"
      );
    }
  }
);

export const addCity = createAsyncThunk(
  "forecast/addCity",
  async ({ name }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const res = await axios.post("/cities", { name });

      if (!res.data.success) return rejectWithValue(res.data.message);
      await dispatch(fetchCities());
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add city"
      );
    }finally{
      dispatch(setLoading(false));
    }
  }
);

// Fetch weather by coordinates
export const fetchWeatherByCoords = createAsyncThunk(
  "forecast/fetchWeatherByCoords",
  async ({ latitude, longitude }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));
      dispatch(setShowSuggestions(false));
      dispatch(setSuggestions([]));

      const token = localStorage.getItem("token"); // fallback quick approach
      if (!token)
        return rejectWithValue("Unauthorized: Please login to view forecast");

      const res = await axios.get(
        `/weather/coords?lat=${latitude}&lon=${longitude}`
      );

      const json = res.data;

      if (!json.success) return rejectWithValue(json.message);

      const weather = json.data; // actual weather data is inside .data

      if (!weather.current_weather) return rejectWithValue("No weather data");

      dispatch(setTemperature(weather.current_weather.temperature));
      dispatch(setFeelsLike(weather.hourly?.apparent_temperature?.[0] ?? null));
      dispatch(setWind(`${weather.current_weather.windspeed} km/h`));
      dispatch(setWeatherCode(weather.current_weather.weathercode));

      dispatch(
        setForecast(
          (weather.daily?.time || []).slice(0, 3).map((day, i) => ({
            date: day,
            min: weather.daily.temperature_2m_min[i],
            max: weather.daily.temperature_2m_max[i],
            code: weather.daily.weathercode[i],
          }))
        )
      );
    } catch (err) {
      console.error(err);
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
      const token = localStorage.getItem("token"); // fallback quick approach
      if (!token)
        return rejectWithValue("Unauthorized: Please login to view forecast");

      const res = await axios.get(
        `/weather/city?name=${encodeURIComponent(name)}`
      );

      const json = res.data;
      if (!json.success) return rejectWithValue(json.message);

      const cityData = json.data; // actual data is inside .data
      if (cityData.results?.length > 0) {
        const c = cityData.results[0];
        await dispatch(
          fetchWeatherByCoords({ latitude: c.latitude, longitude: c.longitude })
        );
      }
    } catch (err) {
      console.error(err);
      return rejectWithValue("Failed to fetch city weather");
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return true;

      await axios.post("/auth/logout", {});
      return true;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Logout failed"
      );
    }
  }
);

/// Set default city
export const setDefaultCity = createAsyncThunk(
  "forecast/setDefaultCity",
  async (cityId, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("Unauthorized");

      const res = await axios.patch(`/cities/${cityId}/default`, {});

      if (!res.data.success) return rejectWithValue(res.data.message);

      await dispatch(fetchCities());
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Error setting default city"
      );
    }
  }
);

// Remove city
export const removeCity = createAsyncThunk(
  "forecast/removeCity",
  async (cityId, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("Unauthorized");

      const res = await axios.delete(`/cities/${cityId}`);

      if (!res.data.success) return rejectWithValue(res.data.message);

      await dispatch(fetchCities());
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Error removing city"
      );
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
    setCity: (state, action) => {
      state.city = action.payload;
    },
    setDebouncedCity: (state, action) => {
      state.debouncedCity = action.payload;
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    setShowSuggestions: (state, action) => {
      state.showSuggestions = action.payload;
    },
    setTemperature: (state, action) => {
      state.temperature = action.payload;
    },
    setFeelsLike: (state, action) => {
      state.feelsLike = action.payload;
    },
    setWind: (state, action) => {
      state.wind = action.payload;
    },
    setWeatherCode: (state, action) => {
      state.weatherCode = action.payload;
    },
    setForecast: (state, action) => {
      state.forecast = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setHighlightedIndex: (state, action) => {
      state.highlightedIndex = action.payload;
    },
    setCities: (state, action) => {
      state.cities = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    hideSuggestions: (state) => {
      state.showSuggestions = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        if (action.payload) {
          const uniqueCities = action.payload.filter(
            (city, index, self) =>
              index === self.findIndex((c) => c.id === city.id)
          );
          state.cities = uniqueCities;
        }
      })
      .addCase(removeCity.fulfilled, (state, action) => {
        state.cities = state.cities.filter(
          (city) => city.id !== action.payload.id
        );
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.cities = [];
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.error.message;
      });
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
