import { NavigateFunction, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { AuthContextData } from "../context/interfaces/AuthContextData.ts";

//TODO: Receber a rota de login por configuração
const Login = () => {
  const navigate: NavigateFunction = useNavigate();
  const { user } = useAuth() as AuthContextData;

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  return (
    <div className="container">
      <div className="login-register-container">
        <div className="login-logo-wrapper">
          <img src="/fortytwo.png" alt="Your Image" />
        </div>

        <a href="http://localhost:3000/api/auth/42/login" className="btn">
          Login with 42
        </a>
      </div>
    </div>
  );
};

export default Login;
