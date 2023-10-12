import Messages from "./Messages.tsx";
import MessageInput from "./MessageInput.tsx";
import {useChat} from "../context/ChatContext.tsx";
import {ChatContextData} from "../context/interfaces/ChatContextData.ts";
import {useEffect, useState} from "react";
import {v4 as uuidV4} from 'uuid';
import {ComponentMessage} from "../interfaces/ComponentMessage.ts";
import {GroupMessageDto} from "../../../backend/src/chat/dto/group-message.dto.ts";

//TODO: Para funcionar precisa refatorar o backend para enviar as mensagens no novo formato
export const GroupChat = () => {
    const {sendMessage, messages, onlineUsers} = useChat() as ChatContextData;
    const [msg, setMgs] = useState<ComponentMessage[]>([]);
    const [online, setOnline] = useState<string[]>([]);

    useEffect(() => {
        console.log("Messages", messages);
        console.log("Online", onlineUsers);
        setOnline(onlineUsers);

        const componentMessages: ComponentMessage[] = messages.map((message: GroupMessageDto) => {
            return {
                uuid: uuidV4(),
                nickname: message.sender.nickname,
                message: message.message,
                createdAt: message.createdAt,
            }
        });

        setMgs(componentMessages);
    }, []);

    useEffect(() => {
        const componentMessages: ComponentMessage[] = messages.map((message: GroupMessageDto) => {
            return {
                uuid: uuidV4(),
                nickname: message.sender.nickname,
                message: message.message,
                createdAt: message.createdAt,
            }
        });

        setMgs(componentMessages);
    }, [messages]);

    useEffect(() => {
        setOnline(onlineUsers);
    }, [onlineUsers]);


    return (
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
    )
}