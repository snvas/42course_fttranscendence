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

		MessageProfileDto

	} from '$lib/dtos';
	import { getAvatarFromId, getProfile, readAllGroupChats, readChatHistory } from '$lib/api';
	import ChatLayout from '$lib/components/chat/ChatLayout.svelte';
	import GroupList from '$lib/components/chat/GroupList.svelte';

	//  [ ]: verificar se socket está conectado antes de conectar de novo
	$socket.connect();
	$: console.log($socket.id);

	let messages: ComponentMessage[] | null = null;
	// TODO: vai mudar o tipo para exibir o role
	let members: MessageProfileDto[] = [];

	let groupsList: Promise<GroupChatDto[]>;
	let groupChatHistory: Promise<GroupChatHistoryDto[]>;

	async function loadAllGroups(): Promise<GroupChatDto[]> {
		return readAllGroupChats();
	}

	async function loadHistory(): Promise<GroupChatHistoryDto[]> {
		return readChatHistory();
	}

	async function setSelectedMessagesMembers() {
		await groupsList;
		let resHistory = await groupChatHistory;

		console.log('history', resHistory);

		let selectedHistory = resHistory.find((history) => history.id == $selectedGroup?.id) ?? null;
		console.log('selected', selectedHistory);
		messages =
			selectedHistory?.messages.map((message) => {
				return {
					message: message.message,
					createdAt: new Date(message.createdAt).toISOString(),
					nickname: message.sender.nickname == $profile.nickname ? 'me' : message.sender.nickname,
					sync: true
				};
			}) ?? null;
		members = selectedHistory?.members ?? []
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

	groupsList = loadAllGroups();
	groupChatHistory = loadHistory();

	$: $selectedGroup, setSelectedMessagesMembers();
	$: console.log('groupChatHistory', groupChatHistory);
	$: console.log('selectedGroup', $selectedGroup);
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
		<GroupMessages bind:messages {members} sendMessage={null} />
	</div>
</ChatLayout>
