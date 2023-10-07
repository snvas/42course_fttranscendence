// import { useProfile } from "../context/ProfileContext.tsx";
// import { ProfileContextData } from "../context/interfaces/ProfileContextData.ts";
import MessageInput from "../components/MessageInput.tsx";
import Messages from "../components/Messages.tsx";
import {ChatContextData} from "../context/interfaces/ChatContextData.ts";
import {useChat} from "../context/ChatContext.tsx";
import {useEffect, useState} from "react";
import {GroupMessageDto} from "../../../backend/src/chat/dto/group-message.dto.ts";

const Chat = () => {
    const {sendMessage, messages, onlineUsers} = useChat() as ChatContextData;
    const [msg, setMgs] = useState<GroupMessageDto[]>([]);
    const [online, setOnline] = useState<string[]>([]);

    useEffect(() => {
        console.log("Messages", messages);
        console.log("Online", onlineUsers);
        setOnline(onlineUsers);
        setMgs(messages);
    }, []);

    useEffect(() => {
        setMgs(messages);
    }, [messages]);

    useEffect(() => {
        setOnline(onlineUsers);
    }, [onlineUsers]);

    return (
        <div>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <h1 style={{marginRight: "20px"}}>Chat Rooms</h1>

                <button className="btn-chan">General</button>
                <button className="btn-chan">Random</button>
            </div>
            <hr></hr>
            <div style={{display: "flex", flexDirection: "row"}}>
                <div style={{flex: 2, overflowY: "auto", maxHeight: "700px"}}>
                    <h1>Chat</h1> {/* Add channel name here */}
                    <Messages messages={msg}/>
                    <MessageInput send={sendMessage}/>
                </div>
                <div style={{flex: 1, marginRight: "20px", overflowY: "auto", maxHeight: "700px"}}>
                    <h1>Online Users</h1>
                    <ul>
                        {online.map((user: string, index: number) => (
                            <div style={{display: "flex"}}>
                                <li style={{marginRight: "20px"}}
                                    key={index}>{user} {/*Add label Owner, Admin, User*/}</li>
                                <div>
                                    {/* <Create actions for these buttons */}
                                    <button className="btn-hover">DM</button>
                                    <button className="btn-hover">X1</button>
                                    {/*  */}
                                    <button className="btn-hover">Block</button>
                                    <button className="btn-hover">Mute</button>
                                    <button className="btn-hover">Kick</button>
                                    <button className="btn-hover">Ban</button>
                                </div>
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

};

export default Chat;