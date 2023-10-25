export * from '../../../../backend/src/auth/models/response-message.dto';
export * from '../../../../backend/src/auth/models/one-time-password.dto';
export * from '../../../../backend/src/user/models/forty-two-user.dto';
export * from '../../../../backend/src/profile/models/profile.dto';
export * from '../../../../backend/src/profile/models/profile-delete-response.dto';
export * from '../../../../backend/src/chat/models/private-message-history.dto';
export * from '../../../../backend/src/chat/models/private-message.dto';
export * from '../../../../backend/src/chat/models/conversation.dto';
export * from '../../../../backend/src/chat/models/message-profile.dto';
export * from '../../../../backend/src/chat/models/player-status.dto';
export * from '../../../../backend/src/chat/models/group-creation.dto';
export * from '../../../../backend/src/chat/models/group-message.dto';
export * from '../../../../backend/src/chat/models/group-chat.dto';
export * from '../../../../backend/src/chat/models/group-chat-deleted-response.dto';
export * from '../../../../backend/src/chat/models/password-update-response.dto';
export * from '../../../../backend/src/chat/models/group-member.dto';
export * from '../../../../backend/src/chat/interfaces/group-member-deleted-response.interface';
export * from '../../../../backend/src/chat/models/chat-password.dto';
export * from '../../../../backend/src/chat/models/member-role-updated-response.dto';

export type ComponentMessage = {
	message: string;
	createdAt: string;
	nickname: string;
	uuid: string;
	sync: boolean;
};
