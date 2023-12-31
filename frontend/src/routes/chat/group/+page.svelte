<script lang="ts">
	import GroupMessages from '$lib/components/chat/GroupMessages.svelte';
	import { socket, profile, selectedGroup, selectedDirect, playersStatus } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import type {
		ComponentMessage,
		GroupMessageDto,
		GroupChatDto,
		GroupChatHistoryDto,
		GroupChatEventDto,
		GroupMemberDto,
		GroupProfileDto,
		MessageConversationDto
	} from '$lib/dtos';
	import {
		readAllGroupChats,
		readChatHistory,
		joinGroupChat,
		leaveGroupChat,
		addGroupChatUser,
		kickGroupChatUser,
		muteGroupChatMember,
		unmuteGroupChatMember,
		deleteGroupChatById,
		getAvatarFromId,
		updateGroupChatMemberRole,
		banGroupChatMember,
		unbunGroupChatMember
	} from '$lib/api';
	import ChatLayout from '$lib/components/chat/ChatLayout.svelte';
	import GroupList from '$lib/components/chat/GroupList.svelte';
	import AddGroupMember from '$lib/components/chat/AddGroupMember.svelte';
	import { parseISO } from 'date-fns';
	import { chatService } from '$lib/api/services';
	import ConfirmJoinGroup from '$lib/components/chat/ConfirmJoinGroup.svelte';
	import { socketEvent } from '$lib/api/services/SocketsEvents';
	import ConfirmLeaveGroup from '$lib/components/chat/ConfirmLeaveGroup.svelte';
	import GroupMembers from '$lib/components/chat/GroupMembers.svelte';
	import GroupConfig from '$lib/components/chat/GroupConfig.svelte';
	import { verifyUnautorized } from '$lib/utils';

	$socket.connect();

	let messages: ComponentMessage[] | null = null;
	let members: GroupProfileDto[] = [];

	let loadingGroups: Promise<any>;
	let groupsList: GroupChatDto[];
	let groupChatHistory: GroupChatHistoryDto[];
	let confirmJoin: GroupChatDto | null = null;
	let confirmLeave: GroupChatDto | null = null;
	let addMember: GroupChatDto | null = null;
	let configGroup: GroupChatDto | null = null;

	async function loadAllGroups() {
		groupsList = await readAllGroupChats();
		groupChatHistory = await readChatHistory();
		return;
	}

	async function setSelectedMessagesMembers() {
		if (!$selectedGroup) return;
		await loadingGroups;

		let selectedHistory = groupChatHistory.find((h) => h.id == $selectedGroup?.id) ?? null;
		if (!selectedHistory) {
			console.log('HERE');
		}

		let newMessages =
			selectedHistory?.messages.map((message) => {
				return {
					message: message.message,
					createdAt: new Date(message.createdAt).toISOString(),
					nickname: message.sender.nickname == $profile.nickname ? 'me' : message.sender.nickname,
					sync: true,
					blocked: false
				};
			}) ?? null;

		messages = newMessages;
		members = selectedHistory?.members ?? [];
	}

	async function sendMessage(message: string) {
		if (!$selectedGroup) return;
		let selected = $selectedGroup;

		const componentMessage: ComponentMessage = {
			message: message,
			createdAt: new Date().toISOString(),
			nickname: 'me',
			sync: false,
			blocked: false
		};

		if (!profile) {
			console.log('Profile not found');
			return;
		}

		messages = [...(messages ?? []), componentMessage];

		const groupMessage: GroupMessageDto = {
			message,
			groupChat: selected,
			createdAt: parseISO(componentMessage.createdAt),
			sender: {
				id: $profile.id,
				nickname: $profile.nickname
			}
		};

		let backendMessage = await chatService.emitGroupMessage(groupMessage);

		if (!backendMessage) {
			console.log('Error when sending group message');
			return;
		}

		const newHistory: GroupChatHistoryDto[] = groupChatHistory.map(
			(history: GroupChatHistoryDto): GroupChatHistoryDto => {
				if (history.id != backendMessage.groupChat.id) {
					return history;
				}
				if (history.messages.find((m: MessageConversationDto) => m.id === backendMessage.id)) {
					return history;
				}
				history.messages.push(backendMessage);

				return history;
			}
		);

		groupChatHistory = newHistory;
		console.log(`Group message sent: ${JSON.stringify(backendMessage)}`);
		setSelectedMessagesMembers();
	}

	async function onCreateGroup() {
		goto('/chat/group/create');
	}

	async function onJoinGroup(groupId: number, password?: string) {
		let res = await joinGroupChat(groupId, password);
		if (typeof res === 'number') {
			verifyUnautorized(res);
			return res;
		}
		loadingGroups = readChatHistory();
		groupChatHistory = await loadingGroups;
	}

	async function onLeaveGroup(groupId: number): Promise<number | void> {
		let res = await leaveGroupChat(groupId);

		if (typeof res === 'number') {
			verifyUnautorized(res);
			return res;
		}
		let newGroupChatHistory = groupChatHistory.filter((group) => group.id != groupId);
		groupChatHistory = newGroupChatHistory;
	}

	async function onAddGroupChatUser(selected: GroupChatDto | null, profileId: number) {
		let res = await addGroupChatUser(selected!.id, profileId);

		if (typeof res === 'number') {
			verifyUnautorized(res);
			return res;
		}
		addMemberToGroup(res);
	}

	async function onKickGroupChatUser(selected: GroupChatDto | null, profileId: number) {
		let res = await kickGroupChatUser(selected!.id, profileId);

		// succesful kick is recieved by socket
		if (typeof res === 'number') {
			verifyUnautorized(res);
			return res;
		}
	}

	async function onMuteGroupChatMember(group: GroupChatDto | null, profileId: number) {
		let res = await muteGroupChatMember(group!.id, profileId);

		if (typeof res === 'number') {
			verifyUnautorized(res);
			return res;
		}
	}

	async function onUnmuteGroupChatMember(group: GroupChatDto | null, profileId: number) {
		let res = await unmuteGroupChatMember(group!.id, profileId);
		if (typeof res === 'number') {
			verifyUnautorized(res);
			return res;
		}
	}

	async function onUpdateMemberRole(
		selected: GroupChatDto | null,
		profileId: number,
		role: string
	) {
		let res = await updateGroupChatMemberRole(selected!.id, profileId, role);

		if (typeof res === 'number') {
			verifyUnautorized(res);
			return res;
		}
	}

	function removeMemberFromGroup(member: GroupMemberDto) {
		let historyChanged = false;

		for (let history of groupChatHistory) {
			if (history.id == member.groupChat.id) {
				const initialLenght = history.members.length;

				history.members = history.members.filter((m) => m.profile.id !== member.profile.id);

				if (initialLenght !== history.members.length) {
					historyChanged = true;
				}
				break;
			}
		}
		if (historyChanged && $selectedGroup?.id == member.groupChat.id) {
			setSelectedMessagesMembers();
		}
	}

	async function addMemberToGroup(memberJoined: GroupMemberDto) {
		if (memberJoined.profile.id == $profile.id) {
			loadingGroups = readChatHistory();
			groupChatHistory = await loadingGroups;
		}
		let historyChanged = false;
		for (let history of groupChatHistory) {
			if (history.id === memberJoined.groupChat.id) {
				const memberExists = history.members.some(
					(member) => member.profile.id === memberJoined.profile.id
				);
				if (!memberExists) {
					history.members.push(memberJoined);
					historyChanged = true;
				}
				break;
			}
		}
		if (historyChanged && $selectedGroup?.id === memberJoined.groupChat.id) {
			setSelectedMessagesMembers();
		}
	}

	async function onDeletedGroupChat(groupChat: GroupChatDto | null) {
		let res = await deleteGroupChatById(groupChat!.id);
		if (typeof res === 'number') {
			verifyUnautorized(res);
			return res;
		}
	}

	async function onBanGroupMember(group: GroupChatDto | null, profileId: number) {
		let res = await banGroupChatMember(group!.id, profileId);
		if (typeof res === 'number') {
			verifyUnautorized(res);
			return res;
		}
	}

	async function onUnbanGroupMember(group: GroupChatDto | null, profileId: number) {
		let res = await unbunGroupChatMember(group!.id, profileId);
		if (typeof res === 'number') {
			verifyUnautorized(res);
			return res;
		}
	}

	const onGroupMessage = (recievedMessage: GroupMessageDto): void => {
		console.log(`### received group message ${JSON.stringify(recievedMessage.message)}`);

		let index = groupChatHistory.findIndex((h) => h.id === recievedMessage.groupChat.id);
		let newMessages = groupChatHistory[index].messages;

		if (!newMessages.find((m) => m.id === recievedMessage.id)) {
			newMessages.push(recievedMessage);
			groupChatHistory[index].messages = newMessages;

			if ($selectedGroup?.id == groupChatHistory[index].id) {
				setSelectedMessagesMembers();
			}
		}
	};

	const onGroupChatCreated = (created: GroupChatDto): void => {
		console.log(`### received group chat created ${JSON.stringify(created)}`);
		if (!groupsList.find((g) => g.id === created.id)) {
			groupsList = [...groupsList, created];
		}
	};

	//When the group chat password is deleted, the group chat visibility is set to public
	const onGroupChatPasswordDeleted = (groupChatDto: GroupChatDto): void => {
		console.log(`### received group chat password deleted ${JSON.stringify(groupChatDto)}`);

		let newList = groupsList.map((group: GroupChatDto) => {
			if (group.id != groupChatDto.id) return group;

			return { ...group, visibility: 'public' };
		});
		groupsList = newList;
		if ($selectedGroup?.id == groupChatDto.id) {
			$selectedGroup = groupsList.find((g) => g.id == $selectedGroup?.id) ?? null;
		}
	};

	const onGroupChatPasswordUpdated = (groupChatEvent: GroupChatEventDto): void => {
		console.log(`### received group chat password updated ${JSON.stringify(groupChatEvent)}`);

		let newList = groupsList.map((group: GroupChatDto) => {
			if (group.id != groupChatEvent.chatId) return group;

			return { ...group, visibility: 'private' };
		});
		groupsList = newList;
		if ($selectedGroup?.id == groupChatEvent.chatId) {
			$selectedGroup = groupsList.find((g) => g.id == $selectedGroup?.id) ?? null;
		}
	};

	const onJoinedGroupChatMember = (memberJoined: GroupMemberDto): void => {
		console.log(`### received joined group chat member ${JSON.stringify(memberJoined)}`);
		addMemberToGroup(memberJoined);
	};

	const onLeaveGroupChatMember = (memberLeaved: GroupMemberDto): void => {
		console.log(`### received leave group chat member ${JSON.stringify(memberLeaved)}`);
		removeMemberFromGroup(memberLeaved);
	};

	const onAddedGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
		console.log(`### received added group chat member ${JSON.stringify(groupMemberDto)}`);
		addMemberToGroup(groupMemberDto);
	};

	const onKickedGroupChatMember = (memberKicked: GroupMemberDto): void => {
		console.log(`### received kicked group chat member ${JSON.stringify(memberKicked)}`);
		if (memberKicked.profile?.id == $profile?.id) {
			let newGroupChatHistory = groupChatHistory.filter(
				(group) => group.id != memberKicked.groupChat.id
			);
			groupChatHistory = newGroupChatHistory;
			if ($selectedGroup?.id == memberKicked.groupChat.id) {
				$selectedGroup = null;
			}
		}
		removeMemberFromGroup(memberKicked);
	};

	const onMutedGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
		updateMuteStatusForGroupChatMember(groupMemberDto, true);
	};

	const onUnMutedGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
		updateMuteStatusForGroupChatMember(groupMemberDto, false);
	};

	const updateMuteStatusForGroupChatMember = (
		groupMember: GroupMemberDto,
		isMuted: boolean
	): void => {
		console.log(
			`### received ${isMuted ? 'muted' : 'unmuted'} group chat member ${JSON.stringify(
				groupMember
			)}`
		);

		const groupIndex = groupChatHistory.findIndex(
			(history) => history.id === groupMember.groupChat.id
		);

		if (groupIndex !== -1) {
			const group = groupChatHistory[groupIndex];

			const memmberIndex = group.members.findIndex(
				(member) => member.profile.id === groupMember.profile.id
			);

			if (memmberIndex !== -1 && group.members[memmberIndex].isMuted != isMuted) {
				group.members[memmberIndex].isMuted = isMuted;

				groupChatHistory[groupIndex] = { ...group, members: [...group.members] };
				if ($selectedGroup?.id === groupMember.groupChat.id) {
					setSelectedMessagesMembers();
				}
			}
		}
	};

	const onUpdatedGroupChatMemberRole = (groupMember: GroupMemberDto): void => {
		console.log(`### received updated group chat member role ${JSON.stringify(groupMember)}`);
		let newGroupHistory = groupChatHistory;

		let historyIndex = newGroupHistory.findIndex(
			(history) => history.id == groupMember.groupChat.id
		);

		if (historyIndex !== -1) {
			let memberIndex = newGroupHistory[historyIndex].members.findIndex(
				(member) => member.profile.id == groupMember.profile.id
			);

			if (memberIndex !== -1) {
				newGroupHistory[historyIndex].members[memberIndex].role = groupMember.role;

				groupChatHistory = newGroupHistory;
				if ($selectedGroup?.id == groupMember.groupChat.id) {
					setSelectedMessagesMembers();
				}
			}
		}
	};

	const onGroupChatDeleted = (groupChatEvent: GroupChatEventDto): void => {
		console.log(`### received group chat deleted ${JSON.stringify(groupChatEvent)}`);
		handleDeletedGroupChat(groupChatEvent.chatId);
	};

	function handleDeletedGroupChat(chatId: number) {
		groupsList = groupsList.filter((history) => history.id !== chatId);
		if ($selectedGroup?.id === chatId) {
			$selectedGroup = null;
		}
	}

	const onBannedGroupChatMember = (groupMember: GroupMemberDto): void => {
		console.log(`### received group member banned ${JSON.stringify(groupMember)}`);
		changeBanStatus(groupMember, true);
	};

	const onUnbannedGroupChatMember = (groupMember: GroupMemberDto): void => {
		console.log(`### received group member unbanned ${JSON.stringify(groupMember)}`);
		changeBanStatus(groupMember, false);
	};

	function changeBanStatus(groupMember: GroupMemberDto, isBanned: boolean) {
		const groupIndex = groupChatHistory.findIndex(
			(history) => history.id == groupMember.groupChat.id
		);

		if (groupIndex !== -1) {
			const memberIndex = groupChatHistory[groupIndex].members.findIndex(
				(member) => member.profile.id == groupMember.profile.id
			);

			if (memberIndex !== -1) {
				groupChatHistory[groupIndex].members[memberIndex].isBanned = isBanned;

				if ($selectedGroup?.id === groupMember.groupChat.id) {
					if (groupMember.profile.id == $profile.id) {
						$selectedGroup = null;
					}
					setSelectedMessagesMembers();
				}
			}
		}

		if (isBanned) {
			if (
				!groupChatHistory[groupIndex].bannedMembers.find(
					(v) => v.profile.id == groupMember.profile.id
				)
			)
				groupChatHistory[groupIndex].bannedMembers = [
					...groupChatHistory[groupIndex].bannedMembers,
					groupMember
				];
		} else {
			let bannedMembers = groupChatHistory[groupIndex].bannedMembers.filter(
				(v) => v.profile.id != groupMember.profile.id
			);
			groupChatHistory[groupIndex].bannedMembers = bannedMembers;
		}
	}

	$socket.on(socketEvent.RECEIVE_GROUP_MESSAGE, onGroupMessage);
	$socket.on(socketEvent.GROUP_CHAT_CREATED, onGroupChatCreated);
	$socket.on(socketEvent.GROUP_CHAT_DELETED, onGroupChatDeleted);
	$socket.on(socketEvent.GROUP_CHAT_PASSWORD_UPDATED, onGroupChatPasswordUpdated);
	$socket.on(socketEvent.GROUP_CHAT_PASSWORD_DELETED, onGroupChatPasswordDeleted);
	$socket.on(socketEvent.JOINED_GROUP_CHAT_MEMBER, onJoinedGroupChatMember);
	$socket.on(socketEvent.LEAVE_GROUP_CHAT_MEMBER, onLeaveGroupChatMember);
	$socket.on(socketEvent.ADDED_GROUP_CHAT_MEMBER, onAddedGroupChatMember);
	$socket.on(socketEvent.KICKED_GROUP_CHAT_MEMBER, onKickedGroupChatMember);
	$socket.on(socketEvent.GROUP_CHAT_MEMBER_ROLE_UPDATED, onUpdatedGroupChatMemberRole);
	$socket.on(socketEvent.GROUP_CHAT_MEMBER_MUTED, onMutedGroupChatMember);
	$socket.on(socketEvent.GROUP_CHAT_MEMBER_UNMUTED, onUnMutedGroupChatMember);
	$socket.on(socketEvent.GROUP_CHAT_MEMBER_BANNED, onBannedGroupChatMember);
	$socket.on(socketEvent.GROUP_CHAT_MEMBER_UNBANNED, onUnbannedGroupChatMember);

	onDestroy(() => {
		$socket.off(socketEvent.RECEIVE_GROUP_MESSAGE);
		$socket.off(socketEvent.GROUP_CHAT_CREATED);
		$socket.off(socketEvent.GROUP_CHAT_DELETED);
		$socket.off(socketEvent.GROUP_CHAT_PASSWORD_UPDATED);
		$socket.off(socketEvent.GROUP_CHAT_PASSWORD_DELETED);
		$socket.off(socketEvent.JOINED_GROUP_CHAT_MEMBER);
		$socket.off(socketEvent.LEAVE_GROUP_CHAT_MEMBER);
		$socket.off(socketEvent.ADDED_GROUP_CHAT_MEMBER);
		$socket.off(socketEvent.KICKED_GROUP_CHAT_MEMBER);
		$socket.off(socketEvent.GROUP_CHAT_MEMBER_ROLE_UPDATED);
		$socket.off(socketEvent.GROUP_CHAT_MEMBER_MUTED);
		$socket.off(socketEvent.GROUP_CHAT_MEMBER_UNMUTED);
		$socket.off(socketEvent.GROUP_CHAT_MEMBER_BANNED);
		$socket.off(socketEvent.GROUP_CHAT_MEMBER_UNBANNED);
	});

	function iAmAdminOrOwner(selected: GroupChatDto | null, members: GroupProfileDto[]): boolean {
		if ($profile.id == selected?.owner.id) {
			return true;
		}
		if (members.find((m) => m.profile.id == $profile.id)?.role == 'admin') {
			return true;
		}
		return false;
	}

	function iAmMuted(members: GroupProfileDto[]): boolean {
		return members.find((m) => m.profile.id == $profile.id)?.isMuted ?? false;
	}

	function onDirectChat(memberId: number) {
		$selectedDirect = $playersStatus.find((v) => v.id == memberId) ?? null;
		$selectedGroup = null;

		goto('/chat/direct');
	}

	loadingGroups = loadAllGroups();
	setSelectedMessagesMembers();

	$: $selectedGroup, setSelectedMessagesMembers();

	function resetViews(keepSelected?: true) {
		addMember = null;
		confirmJoin = null;
		confirmLeave = null;
		configGroup = null;
		if (!keepSelected) {
			$selectedGroup = null;
		}
	}
</script>

<ChatLayout selected="group">
	<div class="contents" slot="list">
		<div class="w-full flex flex-col grow overflow-x-auto">
			{#await loadingGroups}
				<div class="w-full h-full flex items-center justify-center">Loading</div>
			{:then}
				<GroupList
					allGroups={groupsList}
					myHistory={groupChatHistory}
					on:select={(e) => {
						resetViews(true);
						if ($selectedGroup?.id != e.detail.id) {
							$selectedGroup = e.detail;
						}
					}}
					on:join={(e) => {
						resetViews();
						confirmJoin = e.detail;
					}}
					on:leave={(e) => {
						resetViews();
						confirmLeave = e.detail;
					}}
				/>
			{/await}
		</div>
		<div class="p-3 flex items-center justify-center">
			<button
				class="btn-primary w-3/4 lg:w-full md:text-2xl text-xs flex justify-center h-fit flex-initial"
				on:click={onCreateGroup}
			>
				CREATE A GROUP
			</button>
		</div>
	</div>

	<div class="contents" slot="messages">
		<div class="w-full h-full flex flex-col">
			{#if confirmJoin}
				<ConfirmJoinGroup bind:confirmJoin joinGroup={onJoinGroup} />
			{:else if confirmLeave}
				<ConfirmLeaveGroup bind:confirmLeave leaveGroup={onLeaveGroup} />
			{:else if $selectedGroup}
				<div class="w-full h-full flex flex-col gap-5 lg:flex-row">
					{#if addMember}
						<AddGroupMember
							bind:addMember
							{members}
							on:add={(e) => onAddGroupChatUser($selectedGroup, e.detail)}
							on:kick={(e) => onKickGroupChatUser($selectedGroup, e.detail)}
						/>
					{:else if configGroup}
						<GroupConfig bind:configGroup on:delete={() => onDeletedGroupChat($selectedGroup)} />
					{:else}
						<div class="2xl:w-2/3 lg:w-1/2 w-full flex flex-row">
							<GroupMessages
								bind:messages
								{sendMessage}
								bind:configGroup
								muted={iAmMuted(members)}
							/>
						</div>
					{/if}
					<div class="2xl:w-1/3 lg:w-1/2 w-full flex flex-row">
						<GroupMembers
							{members}
							{getAvatarFromId}
							iAmAdminOrOwner={iAmAdminOrOwner($selectedGroup, members)}
							bind:addMember
							on:kick={(e) => onKickGroupChatUser($selectedGroup, e.detail)}
							on:mute={(e) => onMuteGroupChatMember($selectedGroup, e.detail)}
							on:unmute={(e) => onUnmuteGroupChatMember($selectedGroup, e.detail)}
							on:turn-admin={(e) => onUpdateMemberRole($selectedGroup, e.detail, 'admin')}
							on:remove-admin={(e) => onUpdateMemberRole($selectedGroup, e.detail, 'user')}
							on:ban={(e) => onBanGroupMember($selectedGroup, e.detail)}
							on:unban={(e) => onUnbanGroupMember($selectedGroup, e.detail)}
							on:chat={(e) => onDirectChat(e.detail)}
						/>
					</div>
				</div>
			{:else}
				<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl p-5">
					<div class="flex flex-col w-full items-center gap-3 p-20">
						<p class="text-lg text-gray-400 flex text-center">
							No group selected.<br /> Choose or create one.
						</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</ChatLayout>
