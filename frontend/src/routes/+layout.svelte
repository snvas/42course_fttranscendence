<script lang="ts">
	import { goto } from '$app/navigation';
	import type { DashboardUsersList, PlayerStatusDto, ProfileDTO, SimpleProfileDto } from '$lib/dtos';
	import { onlineUsers, playersStatus, socket, allUsers, friendsList } from '$lib/stores';
	import { onDestroy } from 'svelte';
	import '../tailwind.css';
	import { readAllUsers, readFriends } from '$lib/api';
	import { page } from '$app/stores';
	import { socketEvent } from '$lib/api/services/SocketsEvents';

	async function fetchAllPlayersStatus() {
		if ($page.url.pathname == '/login') {
			return;
		}
		$allUsers = await readAllUsers();
		$friendsList = await readFriends();

		updatePlayersStatus($onlineUsers, $allUsers, $friendsList);
	}

	async function updatePlayersStatus(onlineUsers: PlayerStatusDto[], allUsers: ProfileDTO[], friendsList: SimpleProfileDto[]) {
		let online: DashboardUsersList[] = [];
		let offline: DashboardUsersList[] = [];

		let temp: PlayerStatusDto | null;
		for (let user of allUsers) {
			temp = onlineUsers.find((v) => v.id == user.id) ?? null;
			// TODO:
			let isFriend = friendsList.find((v) => v.id == user.id) ? true : false;
			let isBlocked = false;
			if (temp) {
				online.push({
					...user,
					status: temp.status,
					isFriend,
					isBlocked
				});
			} else {
				offline.push({
					...user,
					status: 'offline',
					isFriend,
					isBlocked
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

	onDestroy(() => {
		$socket.off('connect');
		$socket.off('exception');
		$socket.off('unauthorized');
		$socket.off('playersStatus');
	});

	fetchAllPlayersStatus()

	// TODO: socket para receber quando um usuário novo é criado
	// $: $onlineUsers, fetchAllPlayersStatus();
	$: updatePlayersStatus($onlineUsers, $allUsers, $friendsList);

	$: console.log($friendsList);
</script>

<slot />
