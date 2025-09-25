import { configureStore } from "@reduxjs/toolkit";
import forecastReducer from "./forecastSlice";
import weatherReducer from "./weatherSlice"

export const store = configureStore({
  reducer: {
    forecast: forecastReducer,
    weather: weatherReducer,
  },
});

export default store;
