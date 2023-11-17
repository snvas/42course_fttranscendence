<script lang="ts">
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

	.key-style {
		color: black;
	}

	.start-color {
		color: aqua;
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
		<div class="border-4 p-10 rounded-lg flex flex-col items-center h-fit">
			<p class="md:text-4xl text-2xl">Controls:</p>
			<div class="flex flex-col items-center mt-10 border-dashed border-2 border-white p-5">
				<div class="key-style">W</div>
				<div class="flex flex-row">
					<div class="key-style-disabled">A</div>
					<div class="key-style">S</div>
					<div class="key-style-disabled">D</div>
				</div>
			</div>
			<div class="flex flex-col items-center mt-5 border-dashed border-2 border-white p-5">
				<i class="fa fa-arrow-up key-style" aria-hidden="true"></i>
				<div class="flex flex-row">
					<i class="fa fa-arrow-left key-style-disabled" aria-hidden="true"></i>
					<i class="fa fa-arrow-down key-style" aria-hidden="true"></i>
					<i class="fa fa-arrow-right key-style-disabled" aria-hidden="true"></i>
				</div>
			</div>
		</div>

		<div class="border-4 p-10 rounded-lg flex flex-col items-center gap-10">
			<p class="md:text-4xl text-2xl">Rules:</p>
			<div>
				<p class="md:text-3xl text-2xl mb-5"><span class="start-color">TO START:</span> Just press ENTER, my sweetheart :)</p>
				<p class="md:text-3xl text-2xl mb-5"><span class="win-color">TO WIN:</span> The first to get 5 points wins the match.</p>
				<p class="md:text-3xl text-2xl"><span class="lose-color">TO LOSE:</span> If you quit or get disconnected by any reason, you lose.</p>
			</div>
		</div>
	</div>
</div>
