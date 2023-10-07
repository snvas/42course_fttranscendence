import {GroupMessageDto} from "../../../../backend/src/chat/dto/group-message.dto.ts";

export interface ChatContextData {
    sendMessage: (message: string) => void;
    disconnect: () => void;
    messages: GroupMessageDto[];
    onlineUsers: string[];
}