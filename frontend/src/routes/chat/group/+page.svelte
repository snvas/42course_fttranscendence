<script lang="ts">
	import GroupMessages from '$lib/components/chat/GroupMessages.svelte';
	import { socket, profile, onlineUsers, selectedGroup } from '$lib/stores';
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
		MessageProfileDto,
		ConversationDto
	} from '$lib/dtos';
	import { readAllGroupChats, readChatHistory, joinGroupChat } from '$lib/api';
	import ChatLayout from '$lib/components/chat/ChatLayout.svelte';
	import GroupList from '$lib/components/chat/GroupList.svelte';
	import { parseISO } from 'date-fns';
	import { chatService } from '$lib/api/services';
	import ConfirmJoinGroup from '$lib/components/chat/ConfirmJoinGroup.svelte';
	import type { AxiosResponse } from 'axios';

	//  [ ]: verificar se socket está conectado antes de conectar de novo
	$socket.connect();
	$: console.log($socket.id);

	let messages: ComponentMessage[] | null = null;
	// TODO: vai mudar o tipo para exibir o role
	let members: GroupProfileDto[] = [];

	let groupsList: Promise<GroupChatDto[]>;
	let groupChatHistory: Promise<GroupChatHistoryDto[]>;
	let confirmJoin: GroupChatDto | null = null;

	function loadAllGroups() {
		groupsList = readAllGroupChats();
		groupChatHistory = readChatHistory();
	}

	async function setSelectedMessagesMembers() {
		confirmJoin = null;

		await groupsList;
		let selectedHistory =
			(await groupChatHistory).find((history) => history.id == $selectedGroup?.id) ?? null;
		if (!selectedHistory) {
			loadAllGroups();
			await groupsList;
			selectedHistory =
				(await groupChatHistory).find((history) => history.id == $selectedGroup?.id) ?? null;
		}
		console.log('selected', selectedHistory);

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

		const newHistory: GroupChatHistoryDto[] = (await groupChatHistory).map(
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

		groupChatHistory = Promise.resolve(newHistory);
		console.log(`Group message sent: ${JSON.stringify(backendMessage)}`);
		setSelectedMessagesMembers();
	}

	async function onCreateGroup() {
		goto('/chat/group/create');
	}

	const onGroupMessage = (groupMessage: GroupMessageDto): void => {
		console.log(`### received group message ${JSON.stringify(groupMessage.message)}`);
	};

	const onGroupChatCreated = (groupChatDto: GroupChatDto): void => {
		console.log(`### received group chat created ${JSON.stringify(groupChatDto)}`);
	};

	//When the group chat password is deleted, the group chat visibility is set to public
	const onGroupChatPasswordDeleted = (groupChatDto: GroupChatDto): void => {
		console.log(`### received group chat password deleted ${JSON.stringify(groupChatDto)}`);
	};

	const onGroupChatDeleted = (groupChatEvent: GroupChatEventDto): void => {
		console.log(`### received group chat deleted ${JSON.stringify(groupChatEvent)}`);
	};

	const onGroupChatPasswordUpdated = (groupChatEvent: GroupChatEventDto): void => {
		console.log(`### received group chat password updated ${JSON.stringify(groupChatEvent)}`);
	};

	const onJoinedGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
		console.log(`### received joined group chat member ${JSON.stringify(groupMemberDto)}`);
	};

	const onLeaveGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
		console.log(`### received leave group chat member ${JSON.stringify(groupMemberDto)}`);
	};

	const onAddedGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
		console.log(`### received added group chat member ${JSON.stringify(groupMemberDto)}`);
	};

	const onKickedGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
		console.log(`### received kicked group chat member ${JSON.stringify(groupMemberDto)}`);
	};

	const onUpdatedGroupChatMemberRole = (groupMemberDto: GroupMemberDto): void => {
		console.log(`### received updated group chat member role ${JSON.stringify(groupMemberDto)}`);
	};

	$socket.on('receiveGroupMessage', onGroupMessage);
	$socket.on('groupChatCreated', onGroupChatCreated);
	$socket.on('groupChatDeleted', onGroupChatDeleted);
	$socket.on('groupChatPasswordUpdated', onGroupChatPasswordUpdated);
	$socket.on('groupChatPasswordDeleted', onGroupChatPasswordDeleted);
	$socket.on('joinedGroupChatMember', onJoinedGroupChatMember);
	$socket.on('leaveGroupChatMember', onLeaveGroupChatMember);
	$socket.on('addedGroupChatMember', onAddedGroupChatMember);
	$socket.on('kickedGroupChatMember', onKickedGroupChatMember);
	$socket.on('groupChatMemberRoleUpdated', onUpdatedGroupChatMemberRole);

	onDestroy(() => {
		$socket.off('receiveGroupMessage');
		$socket.off('groupChatCreated');
		$socket.off('groupChatDeleted');
		$socket.off('groupChatPasswordUpdated');
		$socket.off('groupChatPasswordDeleted');
		$socket.off('joinedGroupChatMember');
		$socket.off('leaveGroupChatMember');
		$socket.off('addedGroupChatMember');
		$socket.off('kickedGroupChatMember');
		$socket.off('groupChatMemberRoleUpdated');
	});

	loadAllGroups();
	setSelectedMessagesMembers();

	$: $selectedGroup, setSelectedMessagesMembers();

	$: console.log('groupChatHistory', groupChatHistory);
	// $: console.log('selectedGroup', $selectedGroup);
	$: console.log('messages', messages);
</script>

<ChatLayout selected="group">
	<div class="contents" slot="list">
		<div class="w-full flex flex-col grow overflow-x-auto">
			{#await groupChatHistory then groupChatHistory}
				{#await groupsList then groupsList}
					<GroupList
						allGroups={groupsList}
						myHistory={groupChatHistory}
						on:select={(e) => {
							$selectedGroup = e.detail;
						}}
						on:join={(e) => (confirmJoin = e.detail)}
					/>
				{/await}
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
			<ConfirmJoinGroup bind:confirmJoin joinGroup={joinGroupChat} />
		{:else}
			<GroupMessages bind:messages {members} {sendMessage} />
		{/if}
	</div>
</ChatLayout>
