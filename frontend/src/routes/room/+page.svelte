<script lang="ts">
	import { goto } from '$app/navigation';
	import { socket, useAuth, match } from '$lib/stores';
	import { socketEvent } from '../../../../backend/src/ws/ws-events';
	import type { MatchEventDto } from '$lib/dtos';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { matchMakingService } from '$lib/api';

	const auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		$socket.disconnect();
		goto('/login');
	}

	$socket.on(socketEvent.MATCH_FOUND, (data: MatchEventDto) => {
		match.set(data);
		console.log(`Match found: ${data.matchId}`);
		status = 'confirm';
	});

	$socket.on(socketEvent.MATCH_STARTED, (data: MatchEventDto) => {
		match.set(data);
		console.log(`Match started: ${data.matchId}`);
		goto('/game');
	});

	$socket.on(socketEvent.MATCH_REJECTED, (data: MatchEventDto) => {
		match.set(data);
		console.log(`Match rejected: ${data.matchId}`);
		status = 'waiting-player';
	});

	$: console.log($match);

	let status: 'waiting-player' | 'waiting-confirm' | 'confirm' = 'waiting-player';

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
			goto('/dashboard');
		} catch (e) {
			console.log(e);
		}
	}


	
</script>

<div class="h-full min-h-screen w-full min-w-screen flex flex-col lg:h-screen lg:w-screen">
	<div class="flex-none">
		<PongHeader />
	</div>
	{#if status == 'waiting-player'}
		<div>Aguarde um jogador entrar na sala...</div>
	{:else if status == 'confirm'}
		<div>
			<button on:click={confirmMatch}>Confirmar</button>
			<button on:click={rejectMatch}>Rejeitar</button>
		</div>
	{:else if status == 'waiting-confirm'}
		<div>Aguarde o outro jogador confirmar...</div>
	{/if}
</div>
