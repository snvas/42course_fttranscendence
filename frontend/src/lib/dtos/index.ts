export * from '../../../../backend/src/auth/models/response-message.dto';
export * from '../../../../backend/src/auth/models/one-time-password.dto';
export * from '../../../../backend/src/user/models/forty-two-user.dto';
export * from '../../../../backend/src/profile/models/profile.dto';
export * from '../../../../backend/src/profile/models/profile-delete-response.dto';
export * from '../../../../backend/src/chat/dto/private-message-history.dto';
export * from '../../../../backend/src/chat/dto/private-message.dto';
export * from '../../../../backend/src/chat/dto/conversation.dto';
export * from '../../../../backend/src/chat/dto/message-profile.dto';
export * from '../../../../backend/src/chat/dto/player-status.dto';

export type ComponentMessage = {
	message: string;
	createdAt: string;
	nickname: string;
	uuid: string;
	sync: boolean;
};
