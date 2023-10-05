import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { AuthContextData } from "../context/interfaces/AuthContextData.ts";
import { ChatProvider } from "../context/ChatContext.tsx";

const PrivateRoutes = () => {
  const { user } = useAuth() as AuthContextData;

  return !user ? <Navigate to="/login" /> : <ChatProvider> <Outlet /> </ChatProvider>;
};

export default PrivateRoutes;
