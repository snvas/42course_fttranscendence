import {PlayerStatusDto} from "../../../../backend/src/chat/models/player-status.dto.ts";
import {ConversationDto} from "../../../../backend/src/chat/models/conversation.dto.ts";
import {PrivateMessageHistoryDto} from "../../../../backend/src/chat/models/private-message-history.dto.ts";
import {PrivateMessageDto} from "../../../../backend/src/chat/models/private-message.dto.ts";

export interface ChatContextData {
    sendMessage: (message: string) => void;
    sendPrivateMessage: (message: PrivateMessageDto) => Promise<PrivateMessageDto>;
    disconnect: () => void;
    updatePrivateMessageHistory: (history: PrivateMessageHistoryDto) => void;
    updatePrivateMessageHistoryFromMessageDto: (privateMessageDto: PrivateMessageDto) => void
    privateMessageHistory: PrivateMessageHistoryDto[];
    messages: ConversationDto[];
    playersStatus: PlayerStatusDto[];
}