import {useEffect, useState} from "react";
import {ProfileDTO} from "../../../backend/src/profile/models/profile.dto.ts";
import {AxiosResponse, isAxiosError} from "axios";
import profileService from "../api/ProfileService.ts";
import useThrowAsyncError from "../utils/hooks/useThrowAsyncError.ts";
import {NavigateFunction, useNavigate, useParams} from "react-router-dom";

const PublicProfile = () => {
    const [publicAvatar, setPublicAvatar] = useState<string>()
    const [publicProfile, setPublicProfile] = useState<ProfileDTO>()
    const {profileId} = useParams();
    const navigate: NavigateFunction = useNavigate();
    const throwAsyncError = useThrowAsyncError();

    useEffect(() => {
        const getPublicProfile = async (): Promise<ProfileDTO | undefined> => {
            if (profileId === undefined) {
                navigate("/not-found");
            }

            try {
                const response: AxiosResponse<ProfileDTO> =
                    await profileService.getPublicProfile(Number(profileId));
                setPublicProfile(response.data);
                return response.data;
            } catch (error) {
                if (isAxiosError(error) && error.response?.status !== 404) {
                    throwAsyncError(error);
                }
            }
        }

        getPublicProfile().then(async (profile: ProfileDTO | undefined) => {
            if (!profile?.avatarId) {
                return;
            }

            try {
                const response: AxiosResponse<Blob> = await profileService.getAvatarImage(
                    profile?.avatarId
                );

                const blob: Blob = new Blob([response.data], {
                    type: response.headers["content-type"]
                });
                setPublicAvatar(URL.createObjectURL(blob));
            } catch (error) {
                throwAsyncError(error);
            }
        });
    }, []);

    return (
        <>

            <div className="container-home">
                <div className="dashboard">
                    <h1>Player Dashboard</h1>

                    <br></br>
                    <div>
                        {publicAvatar ? (
                            <img src={publicAvatar} alt="User Avatar Image"
                                 style={{maxWidth: '200px', maxHeight: '200px'}}/>
                        ) : (
                            <img src="/default-avatar.jpeg" alt="Default Avatar Image"
                                 style={{maxWidth: '200px', maxHeight: '200px'}}/>
                        )}
                        <p>Nickname: {publicProfile?.nickname}</p>
                        <p>Level: 1</p>
                    </div>
                    <br></br>
                    <p>Wins: {publicProfile?.wins}</p>
                    <p>Draws: {publicProfile?.draws}</p>
                    <p>Loses: {publicProfile?.losses}</p>
                </div>

                <div style={{flex: 1, marginRight: "20px", overflowY: "auto", maxHeight: "700px"}}>

                    <div className="match-history">
                        <h1>Match History</h1>
                        <ul>
                            <li>Match 1</li>
                            <li>Match 2</li>
                            <li>Match 3</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PublicProfile;