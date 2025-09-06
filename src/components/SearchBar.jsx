import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCity,
  setTemperature,
  setHighlightedIndex,
  setSuggestions,
  setShowSuggestions,
  setError,
  fetchCityWeatherByName,
} from "@/store/forecastSlice";
import { db, auth } from "@/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useRef } from "react";

import {
  Command,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command"


const GEOCODE_API = import.meta.env.VITE_GEOCODE_API;

export default function SearchBar() {
  const dispatch = useDispatch();
  const { city, showSuggestions, suggestions, highlightedIndex, loading } =
    useSelector((state) => state.forecast);

  const [user] = useAuthState(auth);
  const skipFetchRef = useRef(false);
  const isTypingRef = useRef(false); 
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleOutsideSuggestionEvent = event => {
      if (showSuggestions && !searchInputRef.current.contains(event.target)) {
        dispatch(setShowSuggestions(false));
      }
    };
    window.addEventListener("mousedown", handleOutsideSuggestionEvent);
    return () => window.removeEventListener("mousedown", handleOutsideSuggestionEvent);
  }, [dispatch, showSuggestions]);

useEffect(() => {
  if (skipFetchRef.current) {
    skipFetchRef.current = false;
    dispatch(setShowSuggestions(false));
    dispatch(setSuggestions([]));
    return;
  }


  if (!isTypingRef.current) {
    dispatch(setSuggestions([]));
    dispatch(setShowSuggestions(false));
    return;
  }

  if (city.length < 1) {
    dispatch(setSuggestions([]));
    dispatch(setShowSuggestions(false));
    return;
  }

  const handler = setTimeout(async () => {
    try {
      const res = await fetch(
        `${GEOCODE_API}?name=${encodeURIComponent(city)}&count=10`
      );
      const data = await res.json();
      if (data.results) {
        const unique = Array.from(
          new Map(data.results.map((s) => [`${s.name},${s.country}`, s])).values()
        );
        dispatch(setSuggestions(unique));
        dispatch(setShowSuggestions(true));
      }
    } catch {
      dispatch(setSuggestions([]));
      dispatch(setShowSuggestions(false));
    }
  }, 500);

  return () => clearTimeout(handler);
}, [city, dispatch]);


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

  function handleSelectSuggestion(suggestion) {
  skipFetchRef.current = true;
  isTypingRef.current = false; 
  dispatch(setCity(suggestion.name));
  dispatch(setSuggestions([]));
  dispatch(setHighlightedIndex(-1));
  dispatch(setShowSuggestions(false));
  dispatch(fetchCityWeatherByName(suggestion.name));
}

  function handleKeyDown(e) {
    if (suggestions.length === 0 && e.key === "Enter" && city.trim()) {
      e.preventDefault();
      dispatch(fetchCityWeatherByName(city.trim()));
      dispatch(setShowSuggestions(false));
      return;
    }

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

  return (
    <div className="relative mb-4 md:mb-6" ref={searchInputRef}>
     <Input
  type="text"
  placeholder="Search city..."
  value={city}
  onChange={(e) => {
    isTypingRef.current = true; 
    dispatch(setCity(e.target.value));
    dispatch(setTemperature(null));
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
  <div className="absolute w-full bg-white text-black rounded-md shadow-md mt-1 z-10 max-h-48 overflow-y-auto">
    <Command>
      <CommandList>
        <CommandGroup>
          {suggestions.map((sug, i) => (
            <CommandItem
              key={sug.id ?? `${sug.name}-${sug.country}`}
              value={`${sug.name}, ${sug.country}`}
              onSelect={() => handleSelectSuggestion(sug)}
              className={`${i === highlightedIndex ? "bg-gray-200" : ""}`}
            >
              {sug.name}, {sug.country}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </div>
)}


      {loading && (
        <div className="flex justify-center mt-4">
          <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin border-solid"></div>
        </div>
      )}
    </div>
  );
}
