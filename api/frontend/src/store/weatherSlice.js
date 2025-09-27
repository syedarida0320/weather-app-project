import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../utils/axios";

//  Async thunk for current location weather
export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (_, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(rejectWithValue("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            //  axios replaces fetch
            const res = await axios.get(
              `/weather/public/coords?lat=${latitude}&lon=${longitude}`
            );

            const json = res.data; //  axios auto-parses JSON

            if (!json.success) {
              reject(
                rejectWithValue(json.message || "Failed to fetch weather")
              );
              return;
            }

            const weather = json.data; //  backend sends data inside "data"

            if (!weather.current_weather) {
              reject(rejectWithValue("No weather data"));
              return;
            }

            resolve(weather.current_weather); //  pass only current_weather
          } catch (err) {
            console.error(err);
            reject(rejectWithValue("Unable to fetch weather"));
          }
        },
        () => reject(rejectWithValue("Location access denied"))
      );
    });
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    todayWeather: null,
    loading: false,
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.todayWeather = action.payload; // payload = current_weather
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default weatherSlice.reducer;
