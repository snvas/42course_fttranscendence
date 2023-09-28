import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { AuthContextData } from "../context/interfaces/AuthContextData.ts";

const PrivateRoutes = () => {
  const { user } = useAuth() as AuthContextData;

  return !user ? <Navigate to="/login" /> : <Outlet />;
};

export default PrivateRoutes;
