// import { useProfile } from "../context/ProfileContext.tsx";
// import { ProfileContextData } from "../context/interfaces/ProfileContextData.ts";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import MessageInput from "./MessageInput.tsx";
import Messages from "./Messages.tsx";

const Chat = () => {
  // const { profile } = useProfile() as ProfileContextData;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const send = (value: string) => {
    console.log("sending message...");
    socket?.emit("test", value);
  };

  const messageListener = (message: string) => {
    console.log(`received message ${message}`);
    setMessages((messages) => [...messages, message]);
  };

  useEffect(() => {
    const newSocket = io("http://localhost:3001", { withCredentials: true });
    setSocket(newSocket);
  }, [setSocket]);

  useEffect(() => {
    if (socket) {
      socket.on("test", messageListener);
      return () => {
        socket.off("test", messageListener);
      };
    }
  }, [messageListener]);


  return (
    <div>
      {" "}
      <h1>Chat</h1>
      <MessageInput send={send} />
      <Messages messages={messages} />
    </div>
  );
};

export default Chat;