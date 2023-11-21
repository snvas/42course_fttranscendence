<script lang="ts">
	import { goto } from '$app/navigation';
	import type {
		DashboardUsersList,
		MatchEventDto,
		PlayerStatusDto,
		ProfileDTO,
		SimpleProfileDto
	} from '$lib/dtos';
	import {
		onlineUsers,
		playersStatus,
		socket,
		allUsers,
		friendsList,
		blockList,
		blockedByList,
		match
	} from '$lib/stores';
	import { onDestroy } from 'svelte';
	import '../tailwind.css';
	import {
		matchMakingService,
		readAllUsers,
		readBlockedBy,
		readBlockeds,
		readFriends
	} from '$lib/api';
	import { page } from '$app/stores';
	import { socketEvent } from '$lib/api/services/SocketsEvents';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import { verifyUnautorized } from '$lib/utils';

	const notLoggedInRoutes = ['/', '/login', '/welcome', '/validate-otp'];

	async function fetchAllPlayersStatus() {
		if (notLoggedInRoutes.includes($page.url.pathname)) {
			return;
		}
		$allUsers = await readAllUsers();
		$friendsList = await readFriends();
		$blockList = await readBlockeds();
		$blockedByList = await readBlockedBy();
	}

	async function updatePlayersStatus(
		onlineUsers: PlayerStatusDto[],
		allUsers: ProfileDTO[],
		friendsList: SimpleProfileDto[],
		blockList: SimpleProfileDto[],
		blockedByList: SimpleProfileDto[]
	) {
		let online: DashboardUsersList[] = [];
		let offline: DashboardUsersList[] = [];

		let temp: PlayerStatusDto | null;
		for (let user of allUsers) {
			temp = onlineUsers.find((v) => v.id == user.id) ?? null;
			let isFriend = friendsList.find((v) => v.id == user.id) ? true : false;
			let isBlocked = blockList.find((v) => v.id == user.id) ? true : false;
			let isBlockedBy = blockedByList.find((v) => v.id == user.id) ? true : false;
			if (temp) {
				online.push({
					...user,
					status: temp.status,
					isFriend,
					isBlocked,
					isBlockedBy
				});
			} else {
				offline.push({
					...user,
					status: 'offline',
					isFriend,
					isBlocked,
					isBlockedBy
				});
			}
		}
		$playersStatus = [...online, ...offline];
	}

	const onPlayersStatus = (onlineUsers: PlayerStatusDto[]): void => {
		console.log(`### received online users ${JSON.stringify(onlineUsers)}`);

		$onlineUsers = onlineUsers;
	};

	const onException = (message: string): void => {
		console.log(`### received error message ${JSON.stringify(message)}`);
		throw message;
	};

	const onUnauthorized = (message: string): void => {
		console.log(`### received unauthorized message ${JSON.stringify(message)}`);
		$socket.disconnect();
		goto('/login');
	};

	const onConnect = (): void => {
		console.log('### connected to server via websocket');
	};

	$socket.on('connect', onConnect);
	$socket.on('exception', onException);
	$socket.on('unauthorized', onUnauthorized);
	$socket.on(socketEvent.PLAYERS_STATUS, onPlayersStatus);

	$socket.on(socketEvent.PRIVATE_MATCH_FOUND, (data: MatchEventDto) => {
		console.log(`Private match found: ${data.matchId}`);
		privateMatch = data;
		if (privateMatch.as == 'p1') {
			status = 'waiting-confirm';
		} else {
			status = 'confirm';
		}
	});

	$socket.on(socketEvent.PRIVATE_MATCH_STARTED, (data: MatchEventDto) => {
		match.set(data);
		privateMatch = null;
		console.log(`Private Match started: ${data.matchId}`);
		leaveMatchQueue();
		goto('/game');
	});

	$socket.on(socketEvent.PRIVATE_MATCH_REJECTED, (data: MatchEventDto) => {
		privateMatch = null;
		console.log(`Private Match rejected: ${data.matchId}`);
		status = 'none';
	});

	$socket.on(socketEvent.BLOCKED_BY, (data) => {
		console.log(`Recieved block by: ${data.id}`);
		let newBlockedByList = $blockedByList;
		if (!newBlockedByList.find((v) => v.id == data.id)) {
			$blockedByList = [...newBlockedByList, data];
		}
	});

	$socket.on(socketEvent.UNBLOCKED_BY, (data) => {
		console.log(`Recieved unblock by: ${data.id}`);
		let newBlockedByList = $blockedByList;
		$blockedByList = newBlockedByList.filter((v) => v.id != data.id);
	});

	async function confirmMatch() {
		if (!privateMatch) return;
		try {
			await matchMakingService.acceptPrivateMatch(privateMatch.matchId);
			status = 'waiting-confirm';
		} catch (e) {
			verifyUnautorized(e);
			console.log(e);
		}
	}

	async function rejectMatch() {
		if (!privateMatch) return;
		try {
			await matchMakingService.rejectPrivateMatch(privateMatch.matchId, privateMatch.as);
			status = 'none';
		} catch (e) {
			verifyUnautorized(e);
			console.log(e);
		}
	}

	async function leaveMatchQueue() {
		try {
			await matchMakingService.cancelMatchQueue();
		} catch (e) {
			verifyUnautorized(e);
			console.log(e);
		}
	}

	onDestroy(() => {
		$socket.off('connect');
		$socket.off('exception');
		$socket.off('unauthorized');
		$socket.off('playersStatus');
	});

	fetchAllPlayersStatus();

	let status: 'waiting-confirm' | 'confirm' | 'none' = 'none';
	let privateMatch: MatchEventDto | null = null;

	$: $onlineUsers, fetchAllPlayersStatus();
	$: updatePlayersStatus($onlineUsers, $allUsers, $friendsList, $blockList, $blockedByList);
</script>

{#if status != 'none' && privateMatch}
	<ConfirmModal {status} match={privateMatch} {confirmMatch} {rejectMatch} />
{/if}
<slot />
