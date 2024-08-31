import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  currentCity: {},
  isLoading: false,
  error: "",
};

function reduser(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };
    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };
    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };
    case "rejected":
      return { ...state, isLoading: false, cities: [...state, action.payload] };
    default:
      throw new Error("Unknow action type");
  }
}

const BASE_URL = "http://localhost:8081";

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispacth] = useReducer(
    reduser,
    initialState
  );

  useEffect(() => {
    async function fetchCities() {
      dispacth({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        dispacth({ type: "cities/loaded", payload: data });
      } catch {
        dispacth({ type: "rejected", payload: "error" });
      }
    }
    fetchCities();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (Number(id) === currentCity.id) return;
      dispacth({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await res.json();
        dispacth({ type: "city/loaded", payload: data });
      } catch {
        dispacth({ type: "rejected", payload: "error" });
      }
    },
    [currentCity.id]
  );

  async function createCity(newCity) {
    dispacth({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      dispacth({ type: "city/created", payload: data });
    } catch {
      dispacth({ type: "rejected", payload: "error" });
    }
  }

  async function deleteCity(id) {
    dispacth({ type: "loading" });
    try {
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });

      dispacth({ type: "city/deleted", payload: id });
    } catch {
      dispacth({ type: "rejected", payload: "error" });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw Error("please set the context with reletionshop with Provider");

  return context;
}

export { CitiesProvider, useCities };
