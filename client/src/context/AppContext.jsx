import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../Api/apiInterceptor.js";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  async function logoutUser(navigate) {
    try {
      const { data } = await api.post("api/auth/logout");

      toast.success(data.message);
      setIsAuth(false);
      setUser(null);
      navigate("/login");
    } catch (error) {
      toast.error("Something went wrong", error);
    }
  }

  async function fetchUser() {
    setLoading(true);
    try {
      const { data } = await api.get("api/auth/me");

      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      console.error(error);
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        setIsAuth,
        user,
        setUser,
        loading,
        setLoading,
        fetchUser,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppData = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("AppData must be used within an AppProvider");
  }

  return context;
};
