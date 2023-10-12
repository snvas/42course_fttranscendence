import {createContext, FC, ReactNode, useContext, useEffect, useState} from "react";
import {ProfileContextData} from "./interfaces/ProfileContextData";
import useThrowAsyncError from "../utils/hooks/useThrowAsyncError";
import AuthContext from "./AuthContext";
import {useLocation} from "react-router-dom";
import {AuthContextData} from "./interfaces/AuthContextData.ts";
import profileService from "../api/ProfileService.ts";
import {AxiosResponse, isAxiosError} from "axios";
import {ProfileDTO} from "../../../backend/dist/profile/models/profile.dto";

const ProfileContext = createContext({});

ProfileContext.displayName = "ProfileContext";

interface ProfileProviderProps {
    children: ReactNode;
}

export const ProfileProvider: FC<ProfileProviderProps> = ({children}) => {
    const {user} = useContext(AuthContext) as AuthContextData;
    const [loading, setLoading] = useState<boolean>(true);
    const [avatarImageUrl, setAvatarImageUrl] = useState<string | undefined>(
        undefined
    );
    const [profile, setProfile] = useState<ProfileDTO | null>(null);
    const throwAsyncError = useThrowAsyncError();
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        refreshProfileContext().then(() => setLoading(false));
    }, [user]);

    useEffect(() => {
        getAvatarImage(profile?.avatarId);
    }, [profile?.avatarId]);

    const refreshProfileContext = async (): Promise<void> => {
        if (location.pathname === "/validate-otp") {
            return;
        }

        try {
            const response: AxiosResponse<ProfileDTO> =
                await profileService.getProfile();
            setProfile(response.data);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status !== 404) {
                throwAsyncError(error);
            }
        }
    };

    const updateProfile = async (
        PartialProfile: Partial<ProfileDTO>
    ): Promise<void> => {
        try {
            const response: AxiosResponse<ProfileDTO> =
                await profileService.updateProfile(PartialProfile);
            setProfile(response.data);
        } catch (error) {
            throwAsyncError(error);
        }
    };

    const createProfile = async (nickname: string): Promise<void> => {
        const response: AxiosResponse<ProfileDTO> =
            await profileService.createProfile(nickname);
        setProfile(response.data);
    };

    const uploadAvatarImage = async (formData: FormData): Promise<void> => {
        try {
            await profileService.uploadAvatarImage(formData);
            await refreshProfileContext();
        } catch (error) {
            throwAsyncError(error);
        }
    };

    const getAvatarImage = async (
        avatarId: number | undefined
    ): Promise<void> => {
        if (!avatarId) {
            return;
        }

        try {
            const response: AxiosResponse<Blob> = await profileService.getAvatarImage(
                avatarId
            );

            const blob: Blob = new Blob([response.data], {
                type: response.headers["content-type"]
            });
            setAvatarImageUrl(URL.createObjectURL(blob));
        } catch (error) {
            throwAsyncError(error);
        }
    };

    const deleteAccount = async (): Promise<void> => {
        try {
            await profileService.deleteAccount();
            setProfile(null);
        } catch (error) {
            throwAsyncError(error);
        }
    };

    const contextData: ProfileContextData = {
        profile,
        avatarImageUrl,
        refreshProfileContext,
        createProfile,
        updateProfile,
        uploadAvatarImage,
        deleteAccount
    };

    return (
        <ProfileContext.Provider value={contextData}>
            {loading ? <p>Loading...</p> : children}
        </ProfileContext.Provider>
    );
};

export const useProfile = (): unknown => useContext(ProfileContext);

export default ProfileContext;
