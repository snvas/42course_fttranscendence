import {GroupMessageDto} from "../../../../backend/src/chat/dto/group-message.dto.ts";
import {PlayerStatusDto} from "../../../../backend/src/chat/dto/player-status.dto.ts";

export interface ChatContextData {
    sendMessage: (message: string) => void;
    disconnect: () => void;
    messages: GroupMessageDto[];
    playersStatus: PlayerStatusDto[];
}