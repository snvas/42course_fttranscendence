import { ChatMessageDto } from "../../../../backend/src/chat/dto/chat-message.dto.ts";

export interface WebSocketContextData {
  sendMessage: (message: string) => void;
  messages: ChatMessageDto[];
  onlineUsers: string[];
}