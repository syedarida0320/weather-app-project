import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

import bgImage from "../assets/bg.webp";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";

import SidebarCities from "@/components/SidebarCities";
import LogoutButton from "@/components/LogoutButton";
import SearchBar from "@/components/SearchBar";
import WeatherInfo from "@/components/WeatherInfo";
import ForecastNextHours from "@/components/ForcastNextHours";

import {
  setCities,
  fetchCityWeatherByName,
  hideSuggestions,
} from "@/store/forecastSlice";

export default function Forecast() {
  const { cities, temperature } = useSelector((state) => state.forecast);
  const dispatch = useDispatch();
  const [user, authLoading] = useAuthState(auth);

  useEffect(() => {
    if (!user || authLoading) return;

    const q = query(
      collection(db, "cities"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cityList = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let createdAt = null;
        if (data.createdAt instanceof Timestamp)
          createdAt = data.createdAt.toMillis();
        else createdAt = data.createdAt;
        return { id: docSnap.id, ...data, createdAt };
      });
      dispatch(setCities(cityList.reverse()));
    });

    return () => unsubscribe();
  }, [user, authLoading, dispatch]);


  useEffect(() => {
    if (!user || cities.length === 0) return;
    const defaultCity = cities.find((c) => c.isDefault);
    if (defaultCity) dispatch(fetchCityWeatherByName(defaultCity.name));
  }, [user, cities, dispatch]);

  useEffect(() => {
    if (temperature !== null) dispatch(hideSuggestions());
  }, [temperature, dispatch]);

  return (
    <div
      className="h-screen w-full bg-cover bg-center relative flex"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <SidebarProvider>
        <SidebarCities />
        <div className="flex-1 flex items-center justify-start md:pl-20">
          <LogoutButton />
          <Card className="w-full md:my-[50px] md:mx-[100px] mx-[20px] my-[50px] max-w-md bg-gradient-to-b from-black/50 via-black/40 to-black/50 backdrop-blur-md text-white shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-center md:text-3xl text-2xl font-bold">
                Weather App
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchBar />
              <WeatherInfo />
              <ForecastNextHours />
            </CardContent>
          </Card>
        </div>
      </SidebarProvider>
    </div>
  );
}
