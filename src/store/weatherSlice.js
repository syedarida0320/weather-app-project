import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const WEATHER_API = import.meta.env.VITE_WEATHER_API;

// ✅ Async thunk for current location weather
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
            const res = await fetch(
              `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
            );
            const data = await res.json();
            resolve(data.current_weather);
          } catch {
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
        state.todayWeather = action.payload;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default weatherSlice.reducer;
