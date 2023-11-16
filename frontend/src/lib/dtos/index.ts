import type {PlayerStatusDto} from '../../../../backend/src/profile/models/player-status.dto';

export * from '../../../../backend/src/auth/models/response-message.dto';
export * from '../../../../backend/src/auth/models/one-time-password.dto';
export * from '../../../../backend/src/user/models/forty-two-user.dto';
export * from '../../../../backend/src/profile/models/profile.dto';
export * from '../../../../backend/src/profile/models/profile-delete-response.dto';
export * from '../../../../backend/src/chat/models/private/private-message-history.dto';
export * from '../../../../backend/src/chat/models/private/private-message.dto';
export * from '../../../../backend/src/chat/models/message/message-conversation.dto';
export * from '../../../../backend/src/chat/models/message/message-profile.dto';
export * from '../../../../backend/src/profile/models/player-status.dto';
export * from '../../../../backend/src/chat/models/group/group-creation.dto';
export * from '../../../../backend/src/chat/models/group/group-message.dto';
export * from '../../../../backend/src/chat/models/group/group-chat.dto';
export * from '../../../../backend/src/chat/models/group/group-chat-deleted-response.dto';
export * from '../../../../backend/src/chat/models/group/group-chat-updated-response.dto';
export * from '../../../../backend/src/chat/models/group/group-member.dto';
export * from '../../../../backend/src/chat/models/group/group-member-deleted-response.dto';
export * from '../../../../backend/src/chat/models/group/group-chat-password.dto';
export * from '../../../../backend/src/chat/models/group/group-chat-history.dto';
export * from '../../../../backend/src/chat/models/group/group-chat-event.dto';
export * from '../../../../backend/src/chat/models/group/group-profile.dto';
export * from '../../../../backend/src/chat/models/group/group-member-updated-response.dto';
export * from '../../../../backend/src/profile/models/simple-profile.dto';
export * from "../../../../backend/src/match/models/match-answer.dto";
export * from '../../../../backend/src/match/models/match-event.dto';
export * from '../../../../backend/src/match/models/match-history.dto';
export * from '../../../../backend/src/game/dto/game.data.dto';
export * from '../../../../backend/src/game/dto/consult.data.dto';

export type ComponentMessage = {
    message: string;
    createdAt: string;
    nickname: string;
    sync: boolean;
    blocked: boolean;
};

export type DashboardUsersList = PlayerStatusDto & {
    isFriend: boolean;
    isBlocked: boolean;
};
