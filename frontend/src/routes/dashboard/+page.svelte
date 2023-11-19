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
		blockList,
		match
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
		chatService,
		matchMakingService
	} from '$lib/api';
	import Button from '$lib/components/Button.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import History from '$lib/components/History.svelte';
	import UsersList from '$lib/components/lists/UsersList.svelte';
	import type { MatchEventDto, MatchHistoryDto, PlayerStatusDto } from '$lib/dtos';
	import { socketEvent } from '$lib/api/services/SocketsEvents';
	import { isAxiosError } from 'axios';
	import { verifyUnautorized } from '$lib/utils';

	let matchHistory: Promise<MatchHistoryDto[]> = onHistory();

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
		try {
			await matchMakingService.joinMatchQueue();
			status = 'waiting-player';
		} catch (error) {
			verifyUnautorized(error);
		}
	}

	async function onCancelQueue() {
		try {
			await matchMakingService.cancelMatchQueue();
			status = 'none';
		} catch (error) {
			verifyUnautorized(error);
		}
	}

	async function onHistory(): Promise<MatchHistoryDto[]> {
		try {
			let history = await matchMakingService.getMatchHistory();
			return history.data;
		} catch (error) {
			verifyUnautorized(error);
			return [];
		}
	}

	async function privateGame(userId: number) {
		try {
			await matchMakingService.createPrivateMatch(userId);
		} catch (error) {
			verifyUnautorized(error);
		}
	}

	async function onChat(user: PlayerStatusDto | null) {
		$selectedDirect = user;
		$selectedGroup = null;
		goto('/chat/direct');
	}

	async function onFriend(userId: number) {
		let res = await addFriend(userId);
		if (typeof res !== 'number' && res != undefined) {
			if (!$friendsList.find((v) => v.id == userId)) {
				$friendsList.push(res);
				$friendsList = $friendsList;
			}
		} else {
			verifyUnautorized(res);
		}
		console.log(res);
	}

	async function onUnfriend(userId: number) {
		let res = await deleteFriend(userId);
		if (res == true) {
			$friendsList = $friendsList.filter((v) => v.id != userId);
		} else {
			verifyUnautorized(res);
		}
	}

	async function onBlock(userId: number) {
		let res = await blockUser(userId);
		if (typeof res !== 'number') {
			if (!$blockList.find((v) => v.id == userId)) {
				$blockList.push(res);
				$blockList = $blockList;
			}
		} else {
			verifyUnautorized(res);
		}
	}

	async function onUnblock(userId: number) {
		let res = await unblockUser(userId);
		if (res == true) {
			$blockList = $blockList.filter((v) => v.id != userId);
		} else {
			verifyUnautorized(res);
		}
	}

	let loadProfile = getProfile();
	let showing: 'play' | 'history' | 'settings' = 'settings';

	loadProfile.then((v) => {
		if (!v) {
			$socket.disconnect();
			goto('/login');
		} else {
			$profile = v.data;
		}
	});

	$socket.on('matchFound', (data) => {
		console.log(data);
	});

	$: avatar = getUserAvatar(loadProfile);

	$socket.on(socketEvent.MATCH_FOUND, (data: MatchEventDto) => {
		console.log(`Match found: ${data.matchId}`);
		match.set(data);
		status = 'confirm';
	});

	$socket.on(socketEvent.MATCH_STARTED, (data: MatchEventDto) => {
		match.set(data);
		console.log(`Match started: ${data.matchId}`);
		goto('/game');
	});

	$socket.on(socketEvent.MATCH_REJECTED, (data: MatchEventDto) => {
		match.set(null);
		console.log(`Match rejected: ${data.matchId}`);
		status = 'waiting-player';
	});

	$: console.log($match);

	let status: 'waiting-player' | 'waiting-confirm' | 'confirm' | 'none' = 'none';

	async function confirmMatch() {
		if (!$match) return;
		try {
			await matchMakingService.acceptMatch($match.matchId, $match.as);
			status = 'waiting-confirm';
		} catch (e) {
			console.log(e);
		}
	}

	async function rejectMatch() {
		if (!$match) return;
		try {
			await matchMakingService.rejectMatch($match.matchId, $match.as);
			await matchMakingService.cancelMatchQueue();
			status = 'none';
			// goto('/dashboard');
		} catch (e) {
			verifyUnautorized(e);
			console.log(e);
		}
	}
</script>

<div class="h-full min-h-screen w-full min-w-screen flex flex-col">
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
					{#await matchHistory then matchs}
						<History {matchs} {avatar} />
					{/await}
				{:else if showing == 'settings'}
					<Settings />
				{/if}
			</div>
			<div class="flex flex-col lg:w-1/3 w-full h-full lg:order-1 order-first gap-10">
				<Profile bind:profile={loadProfile} {onLogout} {avatar} />

				<div class="flex flex-col w-full h-full mx-auto">
					{#if status == 'waiting-player'}
						<div class="flex flex-col mx-auto items-center gap-10 border-4 p-10 rounded-lg">
							<h1 class="text-xl text-center">
								Wait a moment. We are looking for an opponent to start gaming..
							</h1>
						</div>
					{:else if status == 'confirm'}
						<div class="flex flex-col mx-auto items-center gap-10 border-4 p-10 rounded-lg w-full">
							<h1 class="text-xl text-center">
								We found the opponent <span class="text-yellow-500">
									{$match?.as == 'p1' ? $match.p2.nickname : $match?.p1.nickname}</span
								><br /> Start the game?
							</h1>
							<div class="flex flex-row gap-6 w-full">
								<button class="btn-deleted" on:click={rejectMatch}>Not Now</button>
								<button class="btn-primary" on:click={confirmMatch}>Yes, Let's Play</button>
							</div>
						</div>
					{:else if status == 'waiting-confirm'}
						<div class="flex flex-col mx-auto items-center gap-10 border-4 p-10 rounded-lg">
							<h1 class="text-xl text-center">Waiting for the opponent's confirmation...</h1>
						</div>
					{/if}
				</div>

				<div class="flex flex-row items-center h-full">
					<Button type="chat" on:click={() => onChat(null)} />

					<Button
						type="history"
						on:click={() => {
							showing = 'history';
						}}
						clicked={showing == 'history'}
					/>
					<Button
						type="settings"
						on:click={() => (showing = 'settings')}
						clicked={showing == 'settings'}
					/>
					{#if status == 'none'}
						<Button type="play" on:click={onGame} />
					{:else}
						<Button type="cancelQueue" on:click={onCancelQueue} />
					{/if}
				</div>
			</div>
			<div class="gap-15 flex flex-col justify-start lg:w-1/3 w-full h-screen lg:order-2">
				<UsersList
					users={$playersStatus}
					getAvatar={getAvatarFromId}
					loading={loadUsers}
					playDisabled={status != 'none'}
					on:play={(e) => privateGame(e.detail)}
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
