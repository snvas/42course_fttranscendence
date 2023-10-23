<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PlayerStatusDto, ProfileDTO } from '$lib/dtos';
	import { onlineUsers, playersStatus, socket, allUsers } from '$lib/stores';
	import { onDestroy } from 'svelte';
	import '../tailwind.css';
	import { readAllUsers } from '$lib/api';
	import { page } from '$app/stores';
	import { socketEvent } from '$lib/api/services/SocketsEvents';

	async function updateAllPlayersStatus() {
		if ($page.url.pathname == '/login') {
			return;
		}
		$allUsers = await readAllUsers();

		let online: PlayerStatusDto[] = [];
		let offline: PlayerStatusDto[] = [];

		let temp: PlayerStatusDto | null;
		for (let user of $allUsers) {
			temp = $onlineUsers.find((v) => v.id == user.id) ?? null;
			if (temp) {
				online.push({
					...user,
					status: temp.status
				});
			} else {
				offline.push({
					...user,
					status: 'offline'
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

	$: $onlineUsers, updateAllPlayersStatus();
</script>

<slot />
