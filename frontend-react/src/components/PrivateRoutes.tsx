import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { AuthContextData } from "../context/interfaces/AuthContextData.ts";
import { WebSocketProvider } from "../context/WebSocketContext.tsx";

const PrivateRoutes = () => {
  const { user } = useAuth() as AuthContextData;

  return !user ? <Navigate to="/login" /> : <WebSocketProvider> <Outlet /> </WebSocketProvider>;
};

export default PrivateRoutes;
