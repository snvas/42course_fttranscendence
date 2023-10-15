import {useChat} from "../context/ChatContext.tsx";
import {ChatContextData} from "../context/interfaces/ChatContextData.ts";
import {useEffect, useState} from "react";
import {ComponentMessage} from "../interfaces/ComponentMessage.ts";
import {PlayerStatusDto} from "../../../backend/src/chat/dto/player-status.dto.ts";
import {ConversationDto} from "../../../backend/src/chat/dto/conversation.dto.ts";
import {v4 as uuidV4} from "uuid";
import MessageInput from "./MessageInput.tsx";
import Messages from "./Messages.tsx";

export const GroupRoom = () => {
    const {sendMessage, messages, playersStatus} = useChat() as ChatContextData;
    const [msg, setMgs] = useState<ComponentMessage[]>([]);
    const [online, setOnline] = useState<PlayerStatusDto[]>([]);

    useEffect(() => {
        console.log("Messages", messages);
        console.log("Online", playersStatus);
        setOnline(playersStatus);

        const componentMessages: ComponentMessage[] = messages.map((message: ConversationDto) => {
            return {
                uuid: uuidV4(),
                nickname: message.sender.nickname,
                message: message.message,
                createdAt: new Date(message.createdAt).toISOString(),
                sync: false
            }
        });

        setMgs(componentMessages);
    }, []);

    useEffect(() => {
        const componentMessages: ComponentMessage[] = messages.map((message: ConversationDto) => {
            return {
                uuid: uuidV4(),
                nickname: message.sender.nickname,
                message: message.message,
                createdAt: new Date(message.createdAt).toISOString(),
                sync: false
            }
        });

        setMgs(componentMessages);
    }, [messages]);

    useEffect(() => {
        setOnline(playersStatus);
    }, [playersStatus]);


    return (
        <div style={{
            display: "flex", flexDirection: "row",
            margin: "1.5rem 10px 10px 10px",
        }}>
            <div style={{
                flex: 1,
                marginRight: "20px",
                overflowY: "auto",
                maxHeight: "60vh",
                marginLeft: "10px",
                border: "1px solid black",
                height: "60vh",
            }}>
                <h1>Online Users</h1>
                <ul>
                    {online.map((player: PlayerStatusDto) => (
                        <div style={{display: "flex"}}>
                            <li style={{marginRight: "20px"}}
                                key={player.id}>
                                {player.nickname} ({player.status}) - Admin

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
                            </li>
                        </div>
                    ))}
                </ul>
            </div>
            <div style={{
                flex: 2, overflowY: "auto", maxHeight: "60vh",
                border: "1px solid black", margin: "0 10px 0 10px"
            }}>
                <h1>Chat</h1> {/* Add channel name here */}
                <Messages messages={msg}/>
                <MessageInput send={sendMessage}/>
            </div>
        </div>
    )
}