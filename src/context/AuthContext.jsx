import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(); // ✅ FIXED: call createContext()

// create custom hooks
export const useAuth = () => {
  const context = useContext(AuthContext); // ✅ FIXED: define context before using
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ❌ Removed unused anonymous function

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "https://e-commerce-backend-five-iota.vercel.app/api/auth";

  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, [token]);

  const saveSession = (tokenValue, userValue) => {
    setToken(tokenValue);
    setUser(userValue);
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userValue));
  };

  const clearSession = () => {
    setToken(null);
    setUser(null); // ✅ FIXED: was setUser(userValue)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ✅ FIXED: moved logic inside function body
  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      saveSession(data.token, data.user);
      setIsLoading(false);
    } catch (error) {
      setError(error.message); // ✅ FIXED: removed quotes around error.message
    }
  };

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
