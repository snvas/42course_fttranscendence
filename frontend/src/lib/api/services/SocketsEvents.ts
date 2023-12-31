export const socketEvent = {
	PLAYERS_STATUS: 'playersStatus',
	MATCH_FOUND: 'matchFound',
	PRIVATE_MATCH_FOUND: 'privateMatchFound',
	MATCH_STARTED: 'matchStarted',
	PRIVATE_MATCH_STARTED: 'privateMatchStarted',
	MATCH_REJECTED: 'matchRejected',
	PRIVATE_MATCH_REJECTED: 'privateMatchRejected',
	SEND_PRIVATE_MESSAGE: 'sendPrivateMessage',
	RECEIVE_PRIVATE_MESSAGE: 'receivePrivateMessage',
	SEND_GROUP_MESSAGE: 'sendGroupMessage',
	RECEIVE_GROUP_MESSAGE: 'receiveGroupMessage',
	GROUP_CHAT_CREATED: 'groupChatCreated',
	GROUP_CHAT_DELETED: 'groupChatDeleted',
	GROUP_CHAT_PASSWORD_UPDATED: 'groupChatPasswordUpdated',
	GROUP_CHAT_PASSWORD_DELETED: 'groupChatPasswordDeleted',
	JOINED_GROUP_CHAT_MEMBER: 'joinedGroupChatMember',
	LEAVE_GROUP_CHAT_MEMBER: 'leaveGroupChatMember',
	ADDED_GROUP_CHAT_MEMBER: 'addedGroupChatMember',
	KICKED_GROUP_CHAT_MEMBER: 'kickedGroupChatMember',
	GROUP_CHAT_MEMBER_ROLE_UPDATED: 'groupChatMemberRoleUpdated',
	GROUP_CHAT_MEMBER_MUTED: 'groupChatMemberMuted',
	GROUP_CHAT_MEMBER_UNMUTED: 'groupChatMemberUnmuted',
	GROUP_CHAT_MEMBER_BANNED: 'groupChatMemberBanned',
	GROUP_CHAT_MEMBER_UNBANNED: 'groupChatMemberUnbanned',
	GAME_PLAYER_1: 'player1',
	GAME_PLAYER_2: 'player2',
	GAME_BALL: 'ball',
	GAME_PLAYER_IS_READY: 'ready',
	GAME_JOIN_ON_ROOM: 'join',
	GAME_POINT_PLAYER_1: 'p1',
	GAME_POINT_PLAYER_2: 'p2',
	GAME_ABANDONED: 'abandon-match',
	BLOCKED_BY: 'blockedBy',
	UNBLOCKED_BY: 'unblockedBy',
};
