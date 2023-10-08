<script lang="ts">
	import { goto } from '$app/navigation';
	let lineClass = 'bg-white h-7 w-full';
	let chunkClass = 'flex flex-col gap-4 w-full';

	let isLoading = false;

	async function onLogin() {
		isLoading = true;
		await goto('http://localhost:3000/api/auth/42/login');
		isLoading = false;
	}
</script>

<div class="gap-20 flex flex-col h-full justify-center items-center pt-60 md:pt-10 md:h-screen">
	<div class="w-full flex flex-row gap-10 items-center">
		<div class={chunkClass}>
			<div class={lineClass} />
			<div class={lineClass} />
		</div>
		<p class="text-8xl">PONG</p>
		<div class={chunkClass}>
			<div class={lineClass} />
			<div class={lineClass} />
		</div>
	</div>

	<button disabled={isLoading} class="btn-primary md:w-1/4 w-3/4" on:click={onLogin}> Login </button>
</div>
