import {PlayerStatusDto} from "../../../../backend/src/chat/dto/player-status.dto.ts";
import {ConversationDto} from "../../../../backend/src/chat/dto/conversation.dto.ts";

export interface ChatContextData {
    sendMessage: (message: string) => void;
    disconnect: () => void;
    messages: ConversationDto[];
    playersStatus: PlayerStatusDto[];
}