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
import {parseISO} from "date-fns";


export const PrivateChat = () => {
    const [messages, setMessages] = useState<ComponentMessage[]>([]);
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

    useEffect((): void => {
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

    useEffect((): void => {
        console.log(`### Selected user: ${selectedUser} -${JSON.stringify(privateMessageHistory)}`);
        const selectedHistory: PrivateMessageHistoryDto | undefined =
            privateMessageHistory.find((message: PrivateMessageHistoryDto): boolean => selectedUser === message.nickname);

        const messagesFromHistory: ComponentMessage[] | undefined =
            selectedHistory?.messages.map((message: ConversationDto): ComponentMessage => {
                return {
                    message: message.message,
                    createdAt: new Date(message.createdAt).toISOString(),
                    nickname: message.sender.nickname == profile?.nickname ? "me" : message.sender.nickname,
                    uuid: uuidV4(),
                    sync: true
                };
            });


        console.log(`### Messages from history: ${messagesFromHistory}`);
        setMessages(messagesFromHistory || []);
    }, [selectedUser, privateMessageHistory]);


    const handleSelectedUser = (nickname: string) => (): void => {
        setSelectedUser(nickname);
        console.log("Selected User: ", nickname);
    }

    const sendMessage = async (message: string): Promise<void> => {
        const messageDate: string = new Date().toISOString();
        const messageUUID: string = uuidV4();

        const componentMessage: ComponentMessage = {
            message: message,
            createdAt: messageDate,
            nickname: "me",
            uuid: messageUUID,
            sync: false
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

        setMessages([...messages, componentMessage]);

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
            createdAt: parseISO(messageDate)
        }

        const backendMessage: PrivateMessageDto = await sendPrivateMessage(privateMessage);

        if (!backendMessage) {
            console.log("Error when sending private message");
            return
        }

        updatePrivateMessageHistoryFromMessageDto(backendMessage);

        console.log(`Private message sent: ${JSON.stringify(backendMessage)}`);
    }

    const handleSelectedUserHeader = () => {
        const selectedUserStatus: string | undefined = playersStatus.find((playerStatus: PlayerStatusDto): boolean => {
            return playerStatus.nickname === selectedUser
        })?.status;
        return `${selectedUser} (${selectedUserStatus || 'offline'})`;
    }

    return (
        <>
            <div style={{
                display: "flex",
                margin: "1.5rem 10px 10px 10px",
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
                    <h1 style={{textAlign: "center"}}>{!selectedUser ? "Choose a user" : handleSelectedUserHeader()}</h1>
                    <Messages messages={messages}/>
                </div>
                {!selectedUser ? <></> : <MessageInput send={sendMessage}/>}
            </div>
        </>
    );
}