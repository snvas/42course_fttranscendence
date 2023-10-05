import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { ChatContextData } from "./interfaces/ChatContextData.ts";
import { Socket } from "socket.io-client";
import { ChatMessageDto } from "../../../backend/src/chat/dto/chat-message.dto.ts";
import { NavigateFunction, useNavigate } from "react-router-dom";
import chatService from "../api/ws/ChatService.ts";

const ChatContext = createContext({});

ChatContext.displayName = "ChatContext";

interface WebSocketProviderProps {
  children: ReactNode;
}

export const ChatProvider: FC<WebSocketProviderProps> = ({ children }) => {
  // const { user } = useContext(AuthContext) as AuthContextData;
  // const { profile } = useProfile() as ProfileContextData;
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const navigate: NavigateFunction = useNavigate();

  const sendMessage = (message: string) => {
    chatService.emitMessage(message);
  };

  useEffect(() => {
    const socket: Socket = chatService.getSocket();
    socket.connect();

    const onConnect = () => {
      console.log("### connected to server via websocket");
    };

    const onException = (message: string) => {
      console.log(`### received error message ${JSON.stringify(message)}`);
      navigate("/login");
    };

    const onUnauthorized = (message: string) => {
      console.log(`### received unauthorized message ${JSON.stringify(message)}`);
      navigate("/login");
    };

    const onMessage = (message: ChatMessageDto) => {
      console.log(`### received chat message ${JSON.stringify(message)}`);

      setMessages((messages: ChatMessageDto[]) => [...messages, message]);
    };

    const onOnlineUsers = (onlineUsers: string[]) => {
      console.log(`### received online users ${onlineUsers}`);

      setOnlineUsers(onlineUsers);
    };

    socket.on("connect", onConnect);
    socket.on("exception", onException);
    socket.on("unauthorized", onUnauthorized);
    socket.on("message", onMessage);
    socket.on("onlineUsers", onOnlineUsers);

    return () => {
      socket.off("connect");
      socket.off("error");
      socket.off("message");
      socket.off("onlineUsers");
    };
  }, []);


  const contextData: ChatContextData = {
    sendMessage,
    messages,
    onlineUsers
  };

  return <ChatContext.Provider value={contextData}>{children}</ChatContext.Provider>;
};

export const useChat = (): unknown => useContext(ChatContext);