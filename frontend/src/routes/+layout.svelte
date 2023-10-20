<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PlayerStatusDto, ProfileDTO } from '$lib/dtos';
	import { onlineUsers, playersStatus, socket, allUsers } from '$lib/stores';
	import { onDestroy } from 'svelte';
	import '../tailwind.css';
	import { readAllUsers } from '$lib/api';

	async function updateAllPlayersStatus() {
		$allUsers = await readAllUsers();

		let online: PlayerStatusDto[] = [];
		let offline: PlayerStatusDto[] = [];

		for (let user of $allUsers) {
			if ($onlineUsers.find((v) => v.id == user.id)) {
				online.push({
					...user,
					status: 'online'
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
	$socket.on('playersStatus', onPlayersStatus);

	onDestroy(() => {
		$socket.off('connect');
		$socket.off('exception');
		$socket.off('unauthorized');
		$socket.off('playersStatus');
	});

	$: $onlineUsers, updateAllPlayersStatus();
</script>

<slot />
