import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCityWeatherByName,
  setDefaultCity,
  removeCity,
  hideSuggestions, // 👈 new action
} from "@/store/forecastSlice";

export default function SidebarCities() {
  const dispatch = useDispatch();
  const cities = useSelector((state) => state.forecast.cities);

  const handleCityClick = (cityName) => {
    dispatch(fetchCityWeatherByName(cityName));
    dispatch(hideSuggestions()); // 👈 close suggestions immediately
  };

  return (
    <>
      <div className="absolute top-4 left-4 z-50 md:hidden">
        <SidebarTrigger className="bg-black/60 text-white rounded-md p-2" />
      </div>

      <Sidebar className="fixed top-0 left-0 h-full z-40 w-70 bg-black md:bg-white/20 text-white transition-transform duration-300 md:static">
        <SidebarContent className="p-4 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="text-white text-xl font-bold mb-5 md:p-0 pt-[20px]">
              Saved Cities
            </SidebarGroupLabel>

            {cities.length === 0 ? (
              <p className="text-gray-300">No cities added yet.</p>
            ) : (
              <SidebarMenu>
                {cities.map((c) => (
                  <SidebarMenuItem key={c.id}>
                    <SidebarMenuButton
                      className={`flex justify-between bg-gray-700 hover:bg-gray-500 hover:text-white items-center rounded px-2 py-1 ${
                        c.isDefault
                          ? "text-white"
                          : "bg-gray-700 hover:bg-gray-500"
                      }`}
                      onClick={() => handleCityClick(c.name)} // 👈 use handler
                    >
                      <span>{c.name}</span>
                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          tabIndex={0}
                          className="text-xs px-2 py-0.5 rounded text-white hover:bg-gray-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setDefaultCity({ cities, cityId: c.id }));
                          }}
                        >
                          {c.isDefault ? "Default" : "Set Default"}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          className="p-1 hover:bg-gray-700 rounded cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeCity(c.id));
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
