<script lang="ts">
	import GroupMessages from '$lib/components/chat/GroupMessages.svelte';
	import { socket, profile, selectedGroup } from '$lib/stores';
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
		getAvatarFromId,
		updateGroupChatMemberRole
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

	//  [ ]: verificar se socket está conectado antes de conectar de novo
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
		console.log('HERE set');
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
					sync: true
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
			sync: false
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
			return res;
		}
		loadingGroups = readChatHistory();
		groupChatHistory = await loadingGroups;
	}

	async function onLeaveGroup(groupId: number): Promise<number | void> {
		let res = await leaveGroupChat(groupId);

		if (typeof res === 'number') {
			return res;
		}
		let newGroupChatHistory = groupChatHistory.filter((group) => group.id != groupId);
		groupChatHistory = newGroupChatHistory;
	}

	async function onAddGroupChatUser(selected: GroupChatDto | null, profileId: number) {
		let res = await addGroupChatUser(selected!.id, profileId);

		if (typeof res === 'number') {
			return res;
		}
		addMemberToGroup(res);
	}

	async function onKickGroupChatUser(selected: GroupChatDto | null, profileId: number) {
		let res = await kickGroupChatUser(selected!.id, profileId);

		// succesful kick is recieved by socket
		if (res) {
			return res;
		}
	}

	async function onMuteGroupChatMember(group: GroupChatDto | null, profileId: number) {
		let res = await muteGroupChatMember(group!.id, profileId);

		if (typeof res === 'number') {
			return res;
		}
	}

	async function onUnmuteGroupChatMember(group: GroupChatDto | null, profileId: number) {
		let res = await unmuteGroupChatMember(group!.id, profileId);
		if (typeof res === 'number') {
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
			return res;
		}
	}

	function removeMemberFromGroup(member: GroupMemberDto) {
		let newHistory = groupChatHistory.map((history: GroupChatHistoryDto) => {
			if (history.id != member.groupChat.id) {
				return history;
			}

			let newMembers = history.members.filter((v) => v.id != member.id);

			return {
				...history,
				members: newMembers
			};
		});
		if (JSON.stringify(groupChatHistory) != JSON.stringify(newHistory)) {
			groupChatHistory = newHistory;
			if ($selectedGroup?.id == member.groupChat.id) {
				setSelectedMessagesMembers();
			}
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
				const memberExists = history.members.some((member) => member.id === memberJoined.id);
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

	// TODO
	const onGroupChatDeleted = (groupChatEvent: GroupChatEventDto): void => {
		console.log(`### received group chat deleted ${JSON.stringify(groupChatEvent)}`);
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
		if (memberKicked.profile.id == $profile.id) {
			let newGroupChatHistory = groupChatHistory.filter(
				(group) => group.id != memberKicked.groupChat.id
			);
			groupChatHistory = newGroupChatHistory;
			if ($selectedGroup!.id == memberKicked.groupChat.id) {
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
		GroupMemberDto: GroupMemberDto,
		isMuted: boolean
	): void => {
		console.log(
			`### received ${isMuted ? 'muted' : 'unmuted'} group chat member ${JSON.stringify(
				GroupMemberDto
			)}`
		);

		const groupIndex = groupChatHistory.findIndex(
			(history) => history.id === GroupMemberDto.groupChat.id
		);

		if (groupIndex !== -1) {
			const group = groupChatHistory[groupIndex];

			const memmberIndex = group.members.findIndex(
				(member) => member.profile.id === GroupMemberDto.profile.id
			);

			if (memmberIndex !== -1 && group.members[memmberIndex].isMuted != isMuted) {
				group.members[memmberIndex].isMuted = isMuted;

				groupChatHistory[groupIndex] = { ...group, members: [...group.members] };
				if ($selectedGroup?.id === GroupMemberDto.groupChat.id) {
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

	loadingGroups = loadAllGroups();
	setSelectedMessagesMembers();

	$: $selectedGroup, setSelectedMessagesMembers();

	//$: console.log('member.id', groupChatHistory);

	// $: console.log('groupChatHistory', groupChatHistory);
	// $: console.log('selectedGroup', $selectedGroup);
	// $: console.log('messages', messages);
	// $: console.log(confirmJoin)
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
			{#await loadingGroups then}
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
		<div class="p-3">
			<button
				class="btn-primary w-full md:text-2xl text-xs flex justify-center h-fit flex-initial"
				on:click={onCreateGroup}
			>
				Criar um Grupo
			</button>
		</div>
	</div>

	<div class="contents" slot="messages">
		{#if confirmJoin}
			<ConfirmJoinGroup bind:confirmJoin joinGroup={onJoinGroup} />
		{:else if confirmLeave}
			<ConfirmLeaveGroup bind:confirmLeave leaveGroup={onLeaveGroup} />
		{:else if $selectedGroup}
			<div class="w-full h-full flex flex-row gap-5">
				{#if addMember}
					<AddGroupMember
						bind:addMember
						{members}
						on:add={(e) => onAddGroupChatUser($selectedGroup, e.detail)}
					/>
				{:else if configGroup}
					<GroupConfig bind:configGroup />
				{:else}
					<GroupMessages bind:messages {sendMessage} bind:configGroup muted={iAmMuted(members)} />
				{/if}
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
				/>
			</div>
		{:else}
			<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl p-5">
				<div class="flex flex-col w-full items-center gap-3 p-20">
					<p class="text-lg text-gray-400 flex">no group selected</p>
				</div>
			</div>
		{/if}
	</div>
</ChatLayout>
