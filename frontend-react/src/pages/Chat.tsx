// import { useProfile } from "../context/ProfileContext.tsx";
// import { ProfileContextData } from "../context/interfaces/ProfileContextData.ts";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import MessageInput from "../components/MessageInput.tsx";
import Messages from "../components/Messages.tsx";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { ChatMessageDto } from "../../../backend/src/chat/dto/chat-message.dto.ts";

const Chat = () => {
  // const { profile } = useProfile() as ProfileContextData;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const navigate: NavigateFunction = useNavigate();

  const send = (value: string) => {
    console.log("sending message...");
    socket?.emit("message", value);
  };

  const messageListener = (message: ChatMessageDto) => {
    console.log(`received message ${message}`);

    setMessages((messages: ChatMessageDto[]) => [...messages, message]);
  };

  const errorListener = (message: string) => {
    console.log(`# received error message ${JSON.stringify(message)}`);
    navigate("/login");
  };

  useEffect(() => {
    const newSocket = io("http://localhost:3000", { withCredentials: true });
    setSocket(newSocket);
  }, [setSocket]);

  useEffect(() => {
    if (socket) {
      socket.on("message", messageListener);
      return () => {
        socket.off("message", messageListener);
      };
    }
  }, [messageListener]);

  useEffect(() => {
    if (socket) {
      socket.on("exception", errorListener);
      return () => {
        socket.off("exception", errorListener);
      };
    }

  }, [errorListener]);


  return (
    <div>
      {" "}
      <h1>Chat</h1>
      <Messages messages={messages} />
      <MessageInput send={send} />
    </div>
  );
};

export default Chat;