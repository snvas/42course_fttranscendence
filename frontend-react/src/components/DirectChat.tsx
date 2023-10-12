import Messages from "./Messages.tsx";
import MessageInput from "./MessageInput.tsx";
import {useEffect, useState} from "react";
import {ProfileContextData} from "../context/interfaces/ProfileContextData.ts";
import {useProfile} from "../context/ProfileContext.tsx";

export const DirectChat = () => {
    const [msg, setMgs] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const {profile} = useProfile() as ProfileContextData;

    const messageHistory = [
        {
            "id": 2,
            "nickname": "Rods",
            "messages": [
                {
                    "id": 1,
                    "message": "my message",
                    "createdAt": "2023-10-12T03:09:26.089Z",
                    "sender": {
                        "id": 4,
                        "nickname": "euu"
                    }
                }
            ]
        },
        {
            "id": 3,
            "nickname": "roh",
            "messages": [
                {
                    "id": 2,
                    "message": "my message 2",
                    "createdAt": "2023-10-12T03:09:31.810Z",
                    "sender": {
                        "id": 4,
                        "nickname": "ccc"
                    }
                },
                {
                    "id": 3,
                    "message": "my message 3",
                    "createdAt": "2023-10-12T03:09:37.750Z",
                    "sender": {
                        "id": 4,
                        "nickname": "euu"
                    }
                }
            ]
        }
    ];

    useEffect(() => {

        const selectedHistory = messageHistory.find((message) => selectedUser === message.nickname);

        const messagesFromHistory = selectedHistory?.messages.map((message) => {


            return `${profile?.nickname == message.sender.nickname ? "me" : message.sender.nickname}: ${message.message}`;
        });


        setMgs(messagesFromHistory || []);

    }, [selectedUser]);


    const handleSelectedUser = (nickname: string) => () => {
        setSelectedUser(nickname);
        console.log("Selected User: ", nickname);
    }

    const sendMessage = (message: string) => {

        setMgs([...msg, `me: ${message}`])
        console.log("Message: ", message);
    }

    return (
        <>
            <div style={{
                display: "flex",
                margin: "10px",
                height: "60vh",
                maxHeight: "60vh",
            }}>
                <div style={{flex: "30%", border: "1px solid black", marginLeft: "10px"}}>
                    <h1 style={{textAlign: "center"}}>Direct Chat</h1>
                    {messageHistory.map((message, index) => {
                        return (
                            <div key={index}>
                                <button style={{width: "100%"}}
                                        onClick={handleSelectedUser(message.nickname)}>{message.nickname}</button>
                            </div>
                        )
                    })}
                </div>
                <div style={{flex: "70%", border: "1px solid black", margin: "0 10px 0 10px"}}>
                    <h1 style={{textAlign: "center"}}>{!selectedUser ? "Choose a user" : selectedUser}</h1>
                    <Messages messages={msg}/>
                </div>

                <MessageInput send={sendMessage}/>
            </div>
        </>
    );
}