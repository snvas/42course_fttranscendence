import {createContext, FC, ReactNode, useContext, useEffect, useState} from "react";
import {ChatContextData} from "./interfaces/ChatContextData.ts";
import {Socket} from "socket.io-client";
import {NavigateFunction, useNavigate} from "react-router-dom";
import chatService from "../api/ws/ChatService.ts";
import useThrowAsyncError from "../utils/hooks/useThrowAsyncError.ts";
import {PlayerStatusDto} from "../../../backend/src/chat/dto/player-status.dto.ts";
import {ConversationDto} from "../../../backend/src/chat/dto/conversation.dto.ts";

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
    const navigate: NavigateFunction = useNavigate();
    const throwAsyncError = useThrowAsyncError();

    const sendMessage = (message: string) => {
        chatService.emitMessage(message);
    };

    const disconnect = () => {
        chatService.disconnect();
    }

    useEffect(() => {
        const socket: Socket = chatService.getSocket();
        socket.connect();

        const onConnect = () => {
            console.log("### connected to server via websocket");
        };

        const onException = (message: string) => {
            console.log(`### received error message ${JSON.stringify(message)}`);
            throwAsyncError(message);
        };

        const onUnauthorized = (message: string) => {
            console.log(`### received unauthorized message ${JSON.stringify(message)}`);
            socket.disconnect();
            navigate("/login");
        };

        const onMessage = (message: ConversationDto) => {
            console.log(`### received chat message ${JSON.stringify(message)}`);

            setMessages((messages: ConversationDto[]) => [...messages, message]);
        };

        const onPlayersStatus = (onlineUsers: PlayerStatusDto[]) => {
            console.log(`### received online users ${onlineUsers}`);

            setPlayersStatus(onlineUsers);
        };

        socket.on("connect", onConnect);
        socket.on("exception", onException);
        socket.on("unauthorized", onUnauthorized);
        socket.on("message", onMessage);
        socket.on("playersStatus", onPlayersStatus);

        return () => {
            socket.off("connect");
            socket.off("error");
            socket.off("message");
            socket.off("playersStatus");
            socket.disconnect();
        };
    }, []);


    const contextData: ChatContextData = {
        sendMessage,
        disconnect,
        messages,
        playersStatus: playersStatus
    };

    return <ChatContext.Provider value={contextData}>{children}</ChatContext.Provider>;
};

export const useChat = (): unknown => useContext(ChatContext);