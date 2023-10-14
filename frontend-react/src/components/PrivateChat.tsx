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
import {useChat} from "../context/ChatContext.tsx";
import {ChatContextData} from "../context/interfaces/ChatContextData.ts";
import {PlayerStatusDto} from "../../../backend/src/chat/dto/player-status.dto.ts";
import {PrivateMessageDto} from "../../../backend/src/chat/dto/private-message.dto.ts";


export const PrivateChat = () => {
    const [msg, setMgs] = useState<ComponentMessage[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const {profile} = useProfile() as ProfileContextData;
    const {
        privateMessageHistory,
        updatePrivateMessageHistory,
        updatePrivateMessageHistoryFromMessageDto,
        sendPrivateMessage,
        playersStatus
    } = useChat() as ChatContextData;
    const {state} = useLocation();

    useEffect(() => {
        if (!state?.id || !state?.nickname) {
            return;
        }

        const history: PrivateMessageHistoryDto = {
            id: state.id,
            nickname: state.nickname,
            messages: []
        }

        updatePrivateMessageHistory(history);
        setSelectedUser(state.nickname);
    }, []);

    useEffect(() => {
        console.log(`### Selected user: ${selectedUser} -${JSON.stringify(privateMessageHistory)}`);
        const selectedHistory: PrivateMessageHistoryDto | undefined =
            privateMessageHistory.find((message: PrivateMessageHistoryDto): boolean => selectedUser === message.nickname);

        const messagesFromHistory: ComponentMessage[] | undefined =
            selectedHistory?.messages.map((message: ConversationDto): ComponentMessage => {
                return {
                    message: message.message,
                    createdAt: message.createdAt,
                    nickname: message.sender.nickname == profile?.nickname ? "me" : message.sender.nickname,
                    uuid: uuidV4()
                };
            });


        console.log(`### Messages from history: ${messagesFromHistory}`);
        setMgs(messagesFromHistory || []);
    }, [selectedUser, privateMessageHistory]);


    const handleSelectedUser = (nickname: string) => () => {
        setSelectedUser(nickname);
        console.log("Selected User: ", nickname);
    }


    //TODO:
    // Enviar para o backend a mensagem privada, com sender e receiver
    //
    // Receber evento de private message e adicionar na lista de mensagens
    //
    // Resolver problema de confirmação de mensagens enviadas:
    //  Enviar para o backend a mensagem com um UUID que o frontend gerou
    //  Receber do backend o UUID da mensagem que foi enviada com sucesso no callback e fazer o tick
    // ou
    // Receber do backend a mensagem direto e se não receber é porque deu erro
    const sendMessage = async (message: string) => {
        const messageDate: Date = new Date();

        const componentMessage: ComponentMessage = {
            message: message,
            createdAt: messageDate,
            nickname: "me",
            uuid: uuidV4()
        }

        let receiver: PlayerStatusDto | undefined = playersStatus.find((playerStatus: PlayerStatusDto): boolean => {
            return playerStatus.nickname === selectedUser
        });

        if (!receiver) {
            const receiverHistory: PrivateMessageHistoryDto | undefined = privateMessageHistory.find((m: PrivateMessageHistoryDto): boolean => {
                return m.nickname === selectedUser
            })
            if (!receiverHistory) {
                console.log("Receiver not found");
                return;
            }
            receiver = {
                id: receiverHistory.id,
                nickname: receiverHistory.nickname,
                status: "offline"
            }
        }

        if (!profile) {
            console.log("Profile not found");
            return;
        }

        setMgs([...msg, componentMessage]);

        const privateMessage: PrivateMessageDto = {
            message: message,
            receiver: {
                id: receiver.id,
                nickname: receiver.nickname
            },
            sender: {
                id: profile?.id,
                nickname: profile?.nickname
            },
            createdAt: messageDate
        }

        //Receber a mensagem de volta com o ID, passar para o update
        const backendMessage: PrivateMessageDto = await sendPrivateMessage(privateMessage);

        if (!backendMessage) {
            console.log("Error when sending private message");
            return
        }

        //TODO: adicionar icone de enviado com sucesso
        updatePrivateMessageHistoryFromMessageDto(backendMessage);
        console.log(`Private message sent: ${JSON.stringify(backendMessage)}`);
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
                    <h1 style={{textAlign: "center"}}>Private Chat</h1>
                    {privateMessageHistory.map((message: PrivateMessageHistoryDto) => {
                        return (
                            <div key={message.id}>
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