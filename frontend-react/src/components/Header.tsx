import { Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext.tsx";
import { ProfileContextData } from "../context/interfaces/ProfileContextData.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { AuthContextData } from "../context/interfaces/AuthContextData.ts";

const Header = () => {
  const { user, logoutUser } = useAuth() as AuthContextData;
  const { profile } = useProfile() as ProfileContextData;

  return (
    <div className="header">
      <div>
        <a href={"/"} id="header-logo">
          Pong
        </a>
      </div>

      <div className="links--wrapper">
        {user && profile ? (
          <>
            <Link to="/" className="header--link">
              Home
            </Link>
            <Link to="/profile" className="header--link">
              Profile
            </Link>
            <Link to="/chat" className="header--link">
              Chat
            </Link>
            <button onClick={logoutUser} className="btn">
              Logout
            </button>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Header;
