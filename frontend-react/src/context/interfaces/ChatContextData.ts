import {PrivateMessageDto} from "../../../../backend/src/chat/models/private/private-message.dto.ts";
import {PrivateMessageHistoryDto} from "../../../../backend/src/chat/models/private/private-message-history.dto.ts";
import {PlayerStatusDto} from "../../../../backend/src/chat/models/player/player-status.dto.ts";

export interface ChatContextData {
    sendMessage: (message: string) => void;
    sendPrivateMessage: (message: PrivateMessageDto) => Promise<PrivateMessageDto>;
    disconnect: () => void;
    updatePrivateMessageHistory: (history: PrivateMessageHistoryDto) => void;
    updatePrivateMessageHistoryFromMessageDto: (privateMessageDto: PrivateMessageDto) => void
    privateMessageHistory: PrivateMessageHistoryDto[];
    playersStatus: PlayerStatusDto[];
}