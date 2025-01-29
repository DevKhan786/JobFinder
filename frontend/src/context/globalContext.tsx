import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Added useNavigate import

// Define proper TypeScript interfaces
interface Auth0User {
  // Add your Auth0 user properties here
}

interface UserProfile {
  // Add your user profile properties here
}

interface GlobalContextType {
  isAuthenticated: boolean;
  auth0User: Auth0User | null;
  userProfile: UserProfile;
  loading: boolean;
}

const initialValue: GlobalContextType = {
  isAuthenticated: false,
  auth0User: null,
  userProfile: {},
  loading: false,
};

const GlobalContext = createContext<GlobalContextType>(initialValue);

axios.defaults.baseURL = "http://localhost:5000/api";
axios.defaults.withCredentials = true;

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const navigate = useNavigate(); // Get navigate function
  const [state, setState] = useState<GlobalContextType>(initialValue);

  useEffect(() => {
    const checkAuth = async () => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const response = await axios.get("/auth/check-auth");
        setState({
          isAuthenticated: response.data.isAuthenticated,
          auth0User: response.data.user,
          userProfile: {},
          loading: false,
        });

        if (!response.data.isAuthenticated) {
          navigate("/login"); // Use navigate from hook
        }
      } catch (error) {
        console.log(error);
        setState((prev) => ({ ...prev, loading: false }));
        navigate("/login"); // Handle error redirect
      }
    };

    checkAuth();
  }, [navigate]); // Added navigate to dependency array

  return (
    <GlobalContext.Provider value={state}>
      {!state.loading && children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContextProvider"
    );
  }
  return context;
};
