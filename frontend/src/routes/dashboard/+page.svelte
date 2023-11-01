<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		selectedDirect,
		socket,
		useAuth,
		profile,
		playersStatus,
		allUsers,
		selectedGroup,
		friendsList,
		blockList
	} from '$lib/stores';
	import {
		authService,
		getProfile,
		getUserAvatar,
		getAvatarFromId,
		readAllUsers,
		addFriend,
		deleteFriend,
		blockUser,
		unblockUser,
		chatService
	} from '$lib/api';
	import Button from '$lib/components/Button.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import History from '$lib/components/History.svelte';
	import UsersList from '$lib/components/lists/UsersList.svelte';
	import type { PlayerStatusDto } from '$lib/dtos';

	type Match = {
		//oponentID: string;
		openentNick: string;
		oponentAvatar: string | null;
		mineScore: number;
		oponentScore: number;
	};
	const matchs: Match[] = [
		{
			openentNick: 'Teste',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 5
		},
		{
			openentNick: 'Teste2',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 2
		},
		{
			openentNick: 'Teste3',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 2
		},
		{
			openentNick: 'Teste',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 5
		},
		{
			openentNick: 'Teste2',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 6,
			mineScore: 5
		},
		{
			openentNick: 'Teste3',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 4
		},
		{
			openentNick: 'Teste',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 5
		},
		{
			openentNick: 'Teste2',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 5
		},
		{
			openentNick: 'Teste3',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 4
		},
		{
			openentNick: 'Teste',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 1
		}
	];

	const auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		$socket.disconnect();
		goto('/login');
	}

	chatService.connect();

	let loadUsers = readAllUsers();

	loadUsers.then((v) => {
		$allUsers = v;
	});

	async function onLogout() {
		$socket.disconnect();
		await authService.logoutUser();
		goto('/login');
	}

	async function onGame() {
		goto('/game');
	}

	async function onChat(user: PlayerStatusDto | null) {
		$selectedDirect = user;
		$selectedGroup = null;
		goto('/chat/direct');
	}

	async function onFriend(userId: number) {
		let res = await addFriend(userId);
		if (typeof res !== 'number') {
			if (!$friendsList.find((v) => v.id == userId)) {
				$friendsList.push(res);
				$friendsList = $friendsList;
			}
		}
		console.log(res);
	}

	async function onUnfriend(userId: number) {
		let res = await deleteFriend(userId);
		if (res == true) {
			$friendsList = $friendsList.filter((v) => v.id != userId);
		}
	}

	async function onBlock(userId: number) {
		let res = await blockUser(userId);
		if (typeof res !== 'number') {
			if (!$blockList.find((v) => v.id == userId)) {
				$blockList.push(res);
				$blockList = $blockList;
			}
		}
		console.log(res);
	}

	async function onUnblock(userId: number) {
		let res = await unblockUser(userId);
		if (res == true) {
			$blockList = $blockList.filter((v) => v.id != userId);
		}
	}

	let loadProfile = getProfile();
	let showing: 'chat' | 'history' | 'settings' = 'history';

	loadProfile.then((v) => {
		if (!v) {
			$socket.disconnect();
			goto('/login');
		} else {
			$profile = v.data;
		}
	});

	$: avatar = getUserAvatar(loadProfile);
</script>

<div class="h-full min-h-screen w-full min-w-screen flex flex-col lg:h-screen lg:w-screen">
	<div class="flex-none">
		<PongHeader />
	</div>
	<div
		class="flex-1 first-letter:w-full flex h-0 lg:flex-row flex-col gap-10 lg:p-10 p-2 min-w-3xl"
	>
		{#await loadProfile}
			<div class="w-full h-full">Carregando</div>
		{:then}
			<div class="flex lg:w-1/3 w-full h-full lg:order-first order-last">
				{#if showing == 'history'}
					<History {matchs} {avatar} />
				{:else if showing == 'settings'}
					<Settings />
				{/if}
			</div>
			<div class="flex flex-col lg:w-1/3 w-full h-full lg:order-1 order-first gap-10">
				<Profile bind:profile={loadProfile} {onLogout} {avatar} />

				<div class="flex flex-row items-center h-full">
					<Button type="chat" on:click={() => onChat(null)} />

					<Button
						type="history"
						on:click={() => {
							showing = 'history';
						}}
					/>
					<Button type="settings" on:click={() => (showing = 'settings')} />
					<Button type="play" on:click={() => onGame()} />
				</div>
			</div>
			<div class="gap-15 flex flex-col justify-start lg:w-1/3 w-full h-full lg:order-2">
				<UsersList
					users={$playersStatus}
					getAvatar={getAvatarFromId}
					loading={loadUsers}
					on:chat={(e) => onChat(e.detail)}
					on:friend={(e) => onFriend(e.detail)}
					on:unfriend={(e) => onUnfriend(e.detail)}
					on:block={(e) => onBlock(e.detail)}
					on:unblock={(e) => onUnblock(e.detail)}
				/>
			</div>
		{/await}
	</div>
</div>
