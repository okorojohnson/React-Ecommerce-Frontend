import { createContext, useState } from "react";

const AuthContext = createContext;

// create custom hooks
export const useAuth = () => {
  return useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  //Endpoint we need to hit to get this data

  const API_URL = "https://e-commerce-backend-five-iota.vercel.app/api/auth";

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const saveSession = (tokenValue, userValue) => {
    setToken(tokenValue);
    setUser(userValue);
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userValue));
  };

  // specail functions being sent out
  const register = async (name, email, password) => {};
  const login = async (email, password) => {};
  const fetchProfile = async () => {};
  const logout = () => {};

  const contextValue = {
    user,
    token,
    isLoading,
    error,
    register,
    login,
    fetchProfile,
    logout,
    isAuthenticated: !!token && !!user,
  };
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
