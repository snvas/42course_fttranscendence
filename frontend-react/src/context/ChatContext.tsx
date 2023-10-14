import {createContext, FC, ReactNode, useContext, useEffect, useState} from "react";
import {ChatContextData} from "./interfaces/ChatContextData.ts";
import {Socket} from "socket.io-client";
import {NavigateFunction, useNavigate} from "react-router-dom";
import chatService from "../api/ChatService.ts";
import useThrowAsyncError from "../utils/hooks/useThrowAsyncError.ts";
import {PlayerStatusDto} from "../../../backend/src/chat/dto/player-status.dto.ts";
import {ConversationDto} from "../../../backend/src/chat/dto/conversation.dto.ts";
import {AxiosResponse} from "axios";
import {PrivateMessageHistoryDto} from "../../../backend/src/chat/dto/private-message-history.dto.ts";
import {PrivateMessageDto} from "../../../backend/src/chat/dto/private-message.dto.ts";

const ChatContext = createContext({});

ChatContext.displayName = "ChatContext";

interface WebSocketProviderProps {
    children: ReactNode;
}

export const ChatProvider: FC<WebSocketProviderProps> = ({children}) => {
    // const { user } = useContext(AuthContext) as AuthContextData;
    // const { profile } = useProfile() as ProfileContextData;
    const [messages, setMessages] = useState<ConversationDto[]>([]);
    const [playersStatus, setPlayersStatus] = useState<PlayerStatusDto[]>([]);
    const [privateMessageHistory, setPrivateMessageHistory] = useState<PrivateMessageHistoryDto[]>([]);
    const navigate: NavigateFunction = useNavigate();
    const throwAsyncError = useThrowAsyncError();


    useEffect(() => {
        const getPrivateMessageHistory = async (): Promise<PrivateMessageHistoryDto[] | undefined> => {
            try {
                const response: AxiosResponse<PrivateMessageHistoryDto[]> = await chatService.getPrivateMessageHistory();

                return response.data;
            } catch (error) {
                throwAsyncError(error);
            }
        }

        getPrivateMessageHistory().then((history: PrivateMessageHistoryDto[] | undefined): void => {
            if (history) {
                setPrivateMessageHistory(history);
            }
        });

        const socket: Socket = chatService.getSocket();
        socket.connect();

        const onConnect = (): void => {
            console.log("### connected to server via websocket");
        };

        const onException = (message: string): void => {
            console.log(`### received error message ${JSON.stringify(message)}`);
            throwAsyncError(message);
        };

        const onUnauthorized = (message: string): void => {
            console.log(`### received unauthorized message ${JSON.stringify(message)}`);
            socket.disconnect();
            navigate("/login");
        };

        const onMessage = (message: ConversationDto): void => {
            console.log(`### received chat message ${JSON.stringify(message)}`);

            setMessages((messages: ConversationDto[]) => [...messages, message]);
        };

        const onPrivateMessage = (message: PrivateMessageDto): void => {
            setPrivateMessageHistory((prevHistory: PrivateMessageHistoryDto[]): PrivateMessageHistoryDto[] => {
                console.log(`### received private ${message.message} message id: ${message.sender.id} | history ids: ${JSON.stringify(prevHistory.map(h => h.id))}`);

                if (!prevHistory.find((history: PrivateMessageHistoryDto): boolean => history.id === message.sender.id)) {
                    const newHistory: PrivateMessageHistoryDto[] = prevHistory;

                    console.log(`### prev history: ${JSON.stringify(prevHistory)}`);
                    newHistory.push({
                        id: message.sender.id,
                        nickname: message.sender.nickname,
                        messages: [
                            {
                                id: message.id,
                                message: message.message,
                                sender: {
                                    id: message.sender.id,
                                    nickname: message.sender.nickname
                                },
                                createdAt: message.createdAt,
                            }
                        ]
                    })

                    console.log(`### new history: ${JSON.stringify(newHistory)}`);

                    return newHistory;
                }

                return prevHistory.map((history: PrivateMessageHistoryDto): PrivateMessageHistoryDto => {
                    if (history.id === message.sender.id) {

                        if (history.messages.find((m: ConversationDto): boolean => m.id === message.id)) {
                            return history;
                        }

                        history.messages.push({
                            id: message.id,
                            message: message.message,
                            sender: {
                                id: message.sender.id,
                                nickname: message.sender.nickname
                            },
                            createdAt: message.createdAt
                        });
                    }
                    return history;
                });
            });
        }

        const onPlayersStatus = (onlineUsers: PlayerStatusDto[]): void => {
            console.log(`### received online users ${onlineUsers}`);

            setPlayersStatus(onlineUsers);
        };

        socket.on("connect", onConnect);
        socket.on("exception", onException);
        socket.on("unauthorized", onUnauthorized);
        socket.on("message", onMessage);
        socket.on("receivePrivateMessage", onPrivateMessage);
        socket.on("playersStatus", onPlayersStatus);

        return () => {
            socket.off("connect");
            socket.off("error");
            socket.off("message");
            socket.off("receivePrivateMessage")
            socket.off("playersStatus");
            socket.disconnect();
        };
    }, []);


    const sendMessage = (message: string): void => {
        chatService.emitMessage(message);
    };

    const sendPrivateMessage = async (message: PrivateMessageDto): Promise<PrivateMessageDto> => {
        return await chatService.emitPrivateMessage(message);
    }

    const disconnect = () => {
        chatService.disconnect();
    }


    const updatePrivateMessageHistory = (history: PrivateMessageHistoryDto): void => {
        if (privateMessageHistory.find((h: PrivateMessageHistoryDto): boolean => h.id == history.id)) {
            return;
        }

        privateMessageHistory.push({
            id: history.id,
            nickname: history.nickname,
            messages: history.messages
        })
        setPrivateMessageHistory(privateMessageHistory);
    }

    const updatePrivateMessageHistoryFromMessageDto = (privateMessageDto: PrivateMessageDto): void => {
        console.log(`Received private message id: ${privateMessageDto.id} from ${privateMessageDto.sender.nickname}`)
        const newHistory: PrivateMessageHistoryDto[] = privateMessageHistory.map((history: PrivateMessageHistoryDto): PrivateMessageHistoryDto => {
            if (history.id != privateMessageDto.receiver.id) {
                return history;
            }

            if (history.messages.find((m: ConversationDto): boolean => m.id === privateMessageDto.id)) {
                return history;
            }

            history.messages.push({
                id: privateMessageDto.id,
                message: privateMessageDto.message,
                sender: privateMessageDto.sender,
                createdAt: privateMessageDto.createdAt,
            })

            return history;
        })
        setPrivateMessageHistory(newHistory);
    }

    const contextData: ChatContextData = {
        sendMessage,
        sendPrivateMessage,
        disconnect,
        updatePrivateMessageHistory,
        updatePrivateMessageHistoryFromMessageDto,
        privateMessageHistory,
        messages,
        playersStatus
    };

    return <ChatContext.Provider value={contextData}>{children}</ChatContext.Provider>;
};

export const useChat = (): unknown => useContext(ChatContext);