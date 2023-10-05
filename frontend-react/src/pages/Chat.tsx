// import { useProfile } from "../context/ProfileContext.tsx";
// import { ProfileContextData } from "../context/interfaces/ProfileContextData.ts";
import MessageInput from "../components/MessageInput.tsx";
import Messages from "../components/Messages.tsx";
import { ChatContextData } from "../context/interfaces/ChatContextData.ts";
import { useChat } from "../context/ChatContext.tsx";
import { useEffect, useState } from "react";
import { ChatMessageDto } from "../../../backend/src/chat/dto/chat-message.dto.ts";

const Chat = () => {
  const { sendMessage, messages, onlineUsers } = useChat() as ChatContextData;
  const [msg, setMgs] = useState<ChatMessageDto[]>([]);
  const [online, setOnline] = useState<string[]>([]);

  useEffect(() => {
    console.log("Messages", messages);
    console.log("Online", onlineUsers);
    setOnline(onlineUsers);
    setMgs(messages);
  }, []);

  useEffect(() => {
    setMgs(messages);
  }, [messages]);

  useEffect(() => {
    setOnline(onlineUsers);
  }, [onlineUsers]);


  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ flex: 2 }}>
        <h1>Chat</h1>
        <Messages messages={msg} />
        <MessageInput send={sendMessage} />
      </div>
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h1>Online Users</h1>
        <ul>
          {online.map((user: string, index: number) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Chat;