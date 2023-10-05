import { ChatMessageDto } from "../../../../backend/src/chat/dto/chat-message.dto.ts";

export interface ChatContextData {
  sendMessage: (message: string) => void;
  messages: ChatMessageDto[];
  onlineUsers: string[];
}