import {PlayerStatusDto} from "../../../../backend/src/chat/dto/player-status.dto.ts";
import {ConversationDto} from "../../../../backend/src/chat/dto/conversation.dto.ts";
import {PrivateMessageHistoryDto} from "../../../../backend/src/chat/dto/private-message-history.dto.ts";

export interface ChatContextData {
    sendMessage: (message: string) => void;
    disconnect: () => void;
    getPrivateMessageHistory: () => Promise<PrivateMessageHistoryDto[] | undefined>;
    messages: ConversationDto[];
    playersStatus: PlayerStatusDto[];
}