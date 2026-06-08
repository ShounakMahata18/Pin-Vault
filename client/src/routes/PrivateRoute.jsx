import { Navigate } from "react-router-dom";
import { AppData } from "../context/AppContext";

const PrivateRoute = ({ children }) => {
  const { isAuth } = AppData();

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
