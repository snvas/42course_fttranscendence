<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/stores';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import player1 from "$lib/assets/avatar-test-1.png"
	import player2 from "$lib/assets/avatar-test-2.png"

	let auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	}

	async function onExit() {
		goto('/dashboard');
	}

</script>

<style>
	.win-color {
		color: #84cc16;
	}

	.lose-color {
		color: #ef4444;
	}

</style>

<div class="w-screen h-full min-h-screen">
	<PongHeader />
	<div class="flex flex-col items-center m-14">
		<div class="border-4 rounded-lg flex flex-col items-center gap-4 h-fit md:p-14 p-12">
			<p class="md:text-8xl text-6xl lose-color">YOU LOSE</p>
			<div class="flex flex-row m-5">
				<div class="flex flex-col items-center">
					<img src={player1} alt="Player 1" class="md:w-24 md:h-24 w-12 h-12">
					<p class="mt-4">Player1</p>
				</div>
				<p class="md:text-6xl text-2xl m-5">2 x 5</p>
				<div class="flex flex-col items-center">
					<img src={player2} alt="Player 2" class="md:w-24 md:h-24 w-12 h-12">
					<p class="mt-4">Player2</p>
				</div>
			</div>
			<button class="btn-primary" >Play again</button>
			<button class="btn-primary-yellow" >Rematch</button>
			<button class="btn-primary-red" on:click={onExit}>Exit</button>
		</div>
	</div>
</div>
