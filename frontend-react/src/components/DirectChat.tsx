import Messages from "./Messages.tsx";
import MessageInput from "./MessageInput.tsx";
import {useEffect, useState} from "react";
import {ProfileContextData} from "../context/interfaces/ProfileContextData.ts";
import {useProfile} from "../context/ProfileContext.tsx";
import {ComponentMessage} from "../interfaces/ComponentMessage.ts";
import {PrivateMessageHistoryDto} from "../../../backend/src/chat/dto/private-message-history.dto.ts";
import {v4 as uuidV4} from 'uuid';
import {ConversationDto} from "../../../backend/src/chat/dto/conversation.dto.ts";
import {useLocation} from "react-router-dom";


export const DirectChat = () => {
    const [msg, setMgs] = useState<ComponentMessage[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [messageHistory, setMessageHistory] = useState<PrivateMessageHistoryDto[]>([]);
    const {profile} = useProfile() as ProfileContextData;
    const {state} = useLocation();

    useEffect(() => {
        const history: PrivateMessageHistoryDto[] = [
            {
                "id": 2,
                "nickname": "Rods",
                "messages": [
                    {
                        "id": 1,
                        "message": "my message",
                        "createdAt": new Date("2023-10-12T03:09:26.089Z"),
                        "sender": {
                            "id": 4,
                            "nickname": "rods"
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
                        "createdAt": new Date("2023-10-12T03:09:37.750Z"),
                        "sender": {
                            "id": 4,
                            "nickname": "ccc"
                        }
                    },
                    {
                        "id": 3,
                        "message": "my message 3",
                        "createdAt": new Date("2023-10-12T03:09:37.750Z"),
                        "sender": {
                            "id": 4,
                            "nickname": "rods"
                        }
                    }
                ]
            },
            {
                "id": 99,
                "nickname": "Teste",
                "messages": []
            }
        ];

        if (!state?.id || !state?.nickname) {
            setMessageHistory(history);
            return;
        }

        history.push({
            id: state.id,
            nickname: state.nickname,
            messages: []
        })

        setMessageHistory(history);
        setSelectedUser(state.nickname);
    }, []);

    useEffect(() => {
        const selectedHistory: PrivateMessageHistoryDto | undefined =
            messageHistory.find((message: PrivateMessageHistoryDto): boolean => selectedUser === message.nickname);

        const messagesFromHistory: ComponentMessage[] | undefined =
            selectedHistory?.messages.map((message: ConversationDto): ComponentMessage => {

                return {
                    message: message.message,
                    createdAt: message.createdAt,
                    nickname: message.sender.nickname == profile?.nickname ? "me" : message.sender.nickname,
                    uuid: uuidV4()
                };
            });


        setMgs(messagesFromHistory || []);

    }, [selectedUser]);


    const handleSelectedUser = (nickname: string) => () => {
        setSelectedUser(nickname);
        console.log("Selected User: ", nickname);
    }

    // Para resolver isso:
    //  Enviar para o backend a mensagem com um UUID que o frontend gerou
    //  Receber do backend o UUID da mensagem que foi enviada com sucesso no callback e fazer o tick
    // ou
    // Receber do backend a mensagem direto e se não receber é porque deu erro
    const sendMessage = (message: string) => {
        const componentMessage: ComponentMessage = {
            message: message,
            createdAt: new Date(),
            nickname: "me",
            uuid: uuidV4()
        }
        setMgs([...msg, componentMessage]);
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
                    {messageHistory.map((message: PrivateMessageHistoryDto, index: number) => {
                        return (
                            <div key={index}>
                                <button
                                    style={{
                                        width: "100%",
                                        backgroundColor: selectedUser === message.nickname ? "black" : "white",
                                        color: selectedUser === message.nickname ? "white" : "black"
                                    }}
                                    onClick={handleSelectedUser(message.nickname)}>
                                    {message.nickname}
                                </button>
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