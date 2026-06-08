import { Navigate } from "react-router-dom";
import { AppData } from "../context/AppContext";

const PublicRoute = ({ children }) => {
  const { isAuth } = AppData();

  return isAuth ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;