<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PlayerStatusDto } from '$lib/dtos';
	import { onlineUsers, socket } from '$lib/stores';
	import { onDestroy } from 'svelte';
	import '../tailwind.css';

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
		$socket.off('exception')
		$socket.off('unauthorized')
		$socket.off('playersStatus')
	});
</script>

<slot />
