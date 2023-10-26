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
		ConversationDto
	} from '$lib/dtos';
	import { readAllGroupChats, readChatHistory, joinGroupChat, leaveGroupChat } from '$lib/api';
	import ChatLayout from '$lib/components/chat/ChatLayout.svelte';
	import GroupList from '$lib/components/chat/GroupList.svelte';
	import { parseISO } from 'date-fns';
	import { chatService } from '$lib/api/services';
	import ConfirmJoinGroup from '$lib/components/chat/ConfirmJoinGroup.svelte';
	import { socketEvent } from '$lib/api/services/SocketsEvents';
	import ConfirmLeaveGroup from '$lib/components/chat/ConfirmLeaveGroup.svelte';

	//  [ ]: verificar se socket está conectado antes de conectar de novo
	$socket.connect();

	let messages: ComponentMessage[] | null = null;
	let members: GroupProfileDto[] = [];

	let loadingGroups: Promise<any>;
	let groupsList: GroupChatDto[];
	let groupChatHistory: GroupChatHistoryDto[];
	let confirmJoin: GroupChatDto | null = null;
	let confirmLeave: GroupChatDto | null = null;

	async function loadAllGroups() {
		groupsList = await readAllGroupChats();
		groupChatHistory = await readChatHistory();
		return;
	}

	async function setSelectedMessagesMembers() {
		console.log('HERE set');
		if (!$selectedGroup) return;
		confirmJoin = null;
		confirmLeave = null;
		await loadingGroups;

		let selectedHistory = groupChatHistory.find((h) => h.id == $selectedGroup?.id) ?? null;
		if (!selectedHistory) {
			// ???: quando o usuário entra em um grupo, vai setar o $selectedGroup, mas o grupo ainda não vai existir no groupChatHistory
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
				if (history.messages.find((m: ConversationDto) => m.id === backendMessage.id)) {
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

	// TODO
	//When the group chat password is deleted, the group chat visibility is set to public
	const onGroupChatPasswordDeleted = (groupChatDto: GroupChatDto): void => {
		console.log(`### received group chat password deleted ${JSON.stringify(groupChatDto)}`);
	};

	// TODO
	const onGroupChatDeleted = (groupChatEvent: GroupChatEventDto): void => {
		console.log(`### received group chat deleted ${JSON.stringify(groupChatEvent)}`);
	};

	// TODO
	const onGroupChatPasswordUpdated = (groupChatEvent: GroupChatEventDto): void => {
		console.log(`### received group chat password updated ${JSON.stringify(groupChatEvent)}`);
	};

	const onJoinedGroupChatMember = (memberJoined: GroupMemberDto): void => {
		console.log(`### received joined group chat member ${JSON.stringify(memberJoined)}`);
		let newHistory = groupChatHistory.map((history: GroupChatHistoryDto) => {
			if (history.id != memberJoined.groupChat.id) {
				return history;
			}

			if (history.members.find((v) => v.id === memberJoined.id)) {
				return history;
			}

			return {
				...history,
				members: [...history.members, memberJoined]
			};
		});
		groupChatHistory = newHistory;
		if ($selectedGroup?.id == memberJoined.groupChat.id) {
			setSelectedMessagesMembers();
		}
	};

	const onLeaveGroupChatMember = (memberLeaved: GroupMemberDto): void => {
		console.log(`### received leave group chat member ${JSON.stringify(memberLeaved)}`);
		let newHistory = groupChatHistory.map((history: GroupChatHistoryDto) => {
			if (history.id != memberLeaved.groupChat.id) {
				return history;
			}

			let newMembers = history.members.filter((v) => v.id != memberLeaved.id);

			return {
				...history,
				members: newMembers
			};
		});
		groupChatHistory = newHistory;
		if ($selectedGroup?.id == memberLeaved.groupChat.id) {
			setSelectedMessagesMembers();
		}
	};

	// TODO
	const onAddedGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
		console.log(`### received added group chat member ${JSON.stringify(groupMemberDto)}`);
	};

	// TODO
	const onKickedGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
		console.log(`### received kicked group chat member ${JSON.stringify(groupMemberDto)}`);
	};

	// TODO
	const onUpdatedGroupChatMemberRole = (groupMemberDto: GroupMemberDto): void => {
		console.log(`### received updated group chat member role ${JSON.stringify(groupMemberDto)}`);
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
	});

	loadingGroups = loadAllGroups();
	setSelectedMessagesMembers();

	$: $selectedGroup, setSelectedMessagesMembers();

	// $: console.log('groupChatHistory', groupChatHistory);
	// $: console.log('selectedGroup', $selectedGroup);
	// $: console.log('messages', messages);
	// $: console.log(confirmJoin)
</script>

<ChatLayout selected="group">
	<div class="contents" slot="list">
		<div class="w-full flex flex-col grow overflow-x-auto">
			{#await loadingGroups then}
				<GroupList
					allGroups={groupsList}
					myHistory={groupChatHistory}
					on:select={(e) => {
						if ($selectedGroup?.id != e.detail.id) {
							$selectedGroup = e.detail;
						}
					}}
					on:join={(e) => {
						confirmLeave = null;
						$selectedGroup = null;
						confirmJoin = e.detail;
					}}
					on:leave={(e) => {
						confirmJoin = null;
						$selectedGroup = null;
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
		{:else}
			<GroupMessages bind:messages {members} {sendMessage} />
		{/if}
	</div>
</ChatLayout>
