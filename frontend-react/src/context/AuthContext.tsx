import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { AuthContextData } from "./interfaces/AuthContextData.ts";
import axios from "axios";
import { NavigateFunction, useNavigate } from "react-router-dom";
import useThrowAsyncError from "../utils/hooks/useThrowAsyncError.ts";
import authService from "../api/http/AuthService.ts";
import { FortyTwoUserDto } from "../../../backend/dist/user/models/forty-two-user.dto";

const AuthContext = createContext({});

AuthContext.displayName = "AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const navigate: NavigateFunction = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<FortyTwoUserDto | null>(null);
  const throwAsyncError = useThrowAsyncError();

  useEffect(() => {
    validateUserSession().then(() => setLoading(false));
  }, [navigate]);

  const validateUserSession = async (): Promise<void> => {
    try {
      const response =
        location.pathname === "/validate-otp"
          ? await authService.validate2FASession()
          : await authService.validateUserSession();

      setUser(response.data);
    } catch (error) {
      setUser(null);
      navigate("/login");
    }
  };

  const logoutUser = async (): Promise<void> => {
    try {
      await authService.logoutUser();
      setUser(null);
    } catch (error) {
      throwAsyncError(error);
    }
  };

  const enable2FA = async (code: string): Promise<boolean> => {
    try {
      await authService.enable2FA(code);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        throwAsyncError(error);
      }
      return false;
    }
    return true;
  };

  const disable2FA = async (): Promise<void> => {
    try {
      await authService.disable2FA();
      await validateUserSession();
    } catch (error) {
      throwAsyncError(error);
    }
  };

  const validateOTP = async (code: string): Promise<boolean> => {
    try {
      await authService.validateOTP(code);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        throwAsyncError(error);
      }
      return false;
    }
    return true;
  };

  const contextData: AuthContextData = {
    user,
    logoutUser,
    enable2FA,
    disable2FA,
    validateOTP
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <p>Loading...</p> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): unknown => useContext(AuthContext);

export default AuthContext;
