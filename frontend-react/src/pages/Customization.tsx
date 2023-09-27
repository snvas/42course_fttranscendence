//TODO: Criar um contexto de 'Profile'
// se o profile existir, redirecionar para a home
// se não existir, redirecionar exibir esse componente
import { NavigateFunction, useNavigate } from "react-router-dom";
import { ChangeEvent, FormEvent, MutableRefObject, useEffect, useRef, useState } from "react";
import useThrowAsyncError from "../../utils/hooks/useThrowAsyncError.ts";
import { useProfile } from "../../context/ProfileContext.tsx";
import { ProfileContextData } from "../../context/interfaces/ProfileContextData.ts";
import { ProfileDTO } from "../../../backend/src/profile/models/profile.dto.ts";

const Customization = ({title} : {title: string}) => {
  const welcomeForm: MutableRefObject<HTMLFormElement | null> = useRef<HTMLFormElement | null>(null);
  const { profile, createProfile, uploadAvatarImage, updateProfile } = useProfile() as ProfileContextData;
  const navigate: NavigateFunction = useNavigate();
  const throwAsyncError = useThrowAsyncError();
  const [invalidProfile, setInvalidProfile] = useState<boolean>(false);
  const [nicknameSaved, setNicknameSaved] = useState<boolean>(false);
  const [continueToHome, setContinueToHome] = useState<boolean>(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | undefined>(undefined);


  useEffect(() => {
    if (continueToHome) {
      navigate("/");
      return;
    }

  }, [continueToHome, navigate, profile]);

  const handleNicknameSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!welcomeForm.current) {
      return;
    }

    const nickname: string | undefined = welcomeForm.current.nickname?.value;

    try {
      if (!nickname || nickname?.length < 4) {
        setInvalidProfile(true);
        return;
      }

      profile
        ? await updateProfile({ nickname } as Partial<ProfileDTO>)
        : await createProfile(nickname);

      setNicknameSaved(true);
    } catch (error) {
      throwAsyncError(error);
    }
  }
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedAvatar(event.target.files?.[0]);
  };

  const handleAvatarSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const formData: FormData = new FormData();

    if (!selectedAvatar) {
      setContinueToHome(true);
      return;
    }

    formData.append('avatar', selectedAvatar);

    try {
      await uploadAvatarImage(formData);
      setContinueToHome(true);
    } catch (error) {
      throwAsyncError(error);
    }
  }

  return !nicknameSaved ? (
        <>
          <div className="container">
            <h1 className="welcome-title">{title}</h1>
          </div>

            <div className="welcome-form-wrapper">
              <form ref={welcomeForm} onSubmit={handleNicknameSubmit}>

                <div className="form-field-wrapper">
                  <label>Enter your nickname</label>
                  <input type="text" name="nickname" placeholder="nickname" required/>
                </div>

                <div className="form-field-btn-wrapper">
                  <input type="submit" value="Submit" className="btn-small" />
                </div>

              </form>
            </div>

            {invalidProfile && <p className="warning-text">Username must have at least 4 characters, try again</p>}
        </>
       ) : (
        <>
          <div className="container">
            <div className="avatar-register-container">

              <div className="avatar-image-wrapper">
                { selectedAvatar
                  ? <img src= {URL.createObjectURL(selectedAvatar)} alt="Avatar Image" className="avatar-image" />
                  : <img src= "/default-avatar.jpeg" alt="Default Avatar Image" className="avatar-image" />
                }
              </div>
            </div>
          </div>

          <div className="welcome-form-wrapper">

              <div className="form-field-wrapper">
                <label>Upload an avatar and/or continue</label>
              </div>

              <div  className="form-field-wrapper">
                <form onSubmit={handleAvatarSubmit}>
                  <input type="file" accept="image/*" className="" onChange={handleImageUpload} />
                  <button type="submit" className="btn-small">Continue</button>
                </form>
              </div>
          </div>
        </>
       );
};

export default Customization;