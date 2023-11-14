<script lang="ts">
	import keyboardControl from "$lib/assets/keyboard_control.png"
	import arrowControl from "$lib/assets/arrow_control.png"
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/stores';
	import PongHeader from '$lib/components/PongHeader.svelte';

	let auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
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
	<div class="flex flex-col justify-end items-end">
		<a href="/dashboard">
			<i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" />
		</a>
	</div>
	<div class="grid md:grid-cols-2 grid-cols-1 gap-10 m-10">
		<div class="border-4 p-10 rounded-lg flex flex-col items-center gap-4 h-fit">
			<p class="md:text-4xl text-2xl">Controls:</p>
			<img src={keyboardControl} alt="You can use the A, W, S and D keys in your keyboard" class="w-58 h-68 m-4">
			<img src={arrowControl} alt="You can also use the Left, Up, Down and Right arrow keys" class="w-58 h-68 m-4">
		</div>

		<div class="border-4 p-10 rounded-lg flex flex-col items-center gap-10">
			<p class="md:text-4xl text-2xl">Rules:</p>
			<p class="md:text-3xl text-2xl"><span class="win-color">TO WIN:</span> The first to get 5 points wins the match.</p>
			<p class="md:text-3xl text-2xl"><span class="lose-color">TO LOSE:</span> If you quit or get disconnected by any reason, you lose.</p>
		</div>
	</div>
</div>
