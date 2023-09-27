import { AuthContextData } from "../../context/interfaces/AuthContextData.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext.tsx";
import { ProfileContextData } from "../../context/interfaces/ProfileContextData.ts";

const ProfileSettings = () => {
  const navigate: NavigateFunction = useNavigate();
  const { user, disable2FA } = useAuth() as AuthContextData;
  const { profile, avatarImageUrl, deleteAccount} = useProfile() as ProfileContextData;

  const handleDeleteAccount = async (): Promise<void> => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      await deleteAccount();
      navigate("/login");
    }
  }

  return (
    <div className="container">
      <h1>User Profile Settings</h1>

      <br></br>
      <div>
        {avatarImageUrl
          ? <img src={avatarImageUrl} alt="User Avatar Image" />
          : <img src= "/default-avatar.jpeg" alt="Default Avatar Image"/>
        }
        <p>Nickname: {profile?.nickname}</p>
      </div>

      <br></br>
      <button className="btn" onClick={() => navigate("/customization")}>Change your profile</button>


      <br></br>
      <button className="btn" onClick={ user?.otpEnabled ? disable2FA : () => navigate("/register-2fa")} >
        { user?.otpEnabled ? "Disable Two Factor Authentication" : "Enable Two Factor Authentication"}
      </button>

      <br></br>

      <button className="btn" onClick={handleDeleteAccount}>Delete Account</button>

    </div>
  );
};

export default ProfileSettings;
