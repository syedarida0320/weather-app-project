import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
  sidebarOpen: false,
};

const forecastSlice = createSlice({
  name: "forecast",
  initialState,
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
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
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
  setSidebarOpen,
} = forecastSlice.actions;

export default forecastSlice.reducer;
