import {useProfile} from "../context/ProfileContext.tsx";
import {ProfileContextData} from "../context/interfaces/ProfileContextData.ts";
import {PlayerStatusDto} from "../../../backend/src/chat/models/player-status.dto.ts";
import {useEffect, useState} from "react";
import {useChat} from "../context/ChatContext.tsx";
import {ChatContextData} from "../context/interfaces/ChatContextData.ts";
import {Link, NavigateFunction, useNavigate} from "react-router-dom";

const Home = () => {
    const {profile, avatarImageUrl} = useProfile() as ProfileContextData;
    const {playersStatus} = useChat() as ChatContextData;
    const [status, setStatus] = useState<PlayerStatusDto[]>([]);
    const navigate: NavigateFunction = useNavigate();

    useEffect(() => {
        setStatus(playersStatus);
    }, [playersStatus]);

    useEffect(() => {
        setStatus(playersStatus);
    }, []);

    //Start conversation in backend
    const handleDM = (id: number, nickname: string) => {
        console.log("DM", nickname)
        navigate('/chat', {state: {nickname: nickname, id: id}});
    }

    return (
        <>
            <div className="container-home">
                <div className="dashboard">
                    <h1>Player Dashboard</h1>

                    <br></br>
                    <div>
                        {avatarImageUrl ? (
                            <img src={avatarImageUrl} alt="User Avatar Image"
                                 style={{maxWidth: '200px', maxHeight: '200px'}}/>
                        ) : (
                            <img src="/default-avatar.jpeg" alt="Default Avatar Image"
                                 style={{maxWidth: '200px', maxHeight: '200px'}}/>
                        )}
                        <p>Nickname: {profile?.nickname}</p>
                        <p>Level: 1</p>
                    </div>
                    <br></br>
                    <p>Wins: {profile?.wins}</p>
                    <p>Draws: {profile?.draws}</p>
                    <p>Loses: {profile?.losses}</p>
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
                    <hr></hr>
                    <h1>Online Users</h1>
                    <ul>
                        {status.map((player: PlayerStatusDto, index: number) => (
                            <div key={index} style={{display: "flex"}}>
                                <li style={{marginRight: "20px"}}>
                                    <Link to={`/public/${player.id}`}> {player.nickname}</Link> ({player.status})
                                </li>
                                {profile?.nickname === player.nickname ? (
                                    <p>(You)</p>
                                ) : (
                                    <>
                                        <button className="btn-hover"
                                                onClick={() => handleDM(player.id, player.nickname)}>DM
                                        </button>
                                        <button className="btn-hover">X1</button>
                                    </>
                                )}
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Home;
