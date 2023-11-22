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

	async function onLoginGoogle() {
		isLoading = true;
		await goto('http://localhost:3000/api/auth/google/login');
		isLoading = false;
	}
</script>

<div
	class="gap-20 flex flex-col h-full min-h-screen justify-center items-center pt-10 lg:pt-20 w-screen"
>
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

	<button disabled={isLoading} class="btn-primary lg:w-1/4 w-3/4" on:click={onLogin}>
		Login
	</button>

	<div class="px-6 sm:px-0 max-w-sm">
		<button
			disabled={isLoading}
			on:click={onLoginGoogle}
			class="btn-primary w-full text-white  
			bg-[#4285F4] hover:bg-[#4285F4]/90 
			focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 
			font-light rounded-lg text-sm px-5 py-2.5 text-center inline-flex 
			items-center justify-between dark:focus:ring-[#4285F4]/55 mr-2 mb-2"
			><svg
				class="mr-2 -ml-1 w-4 h-4"
				aria-hidden="true"
				focusable="false"
				data-prefix="fab"
				data-icon="google"
				role="img"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 488 512"
				><path
					fill="currentColor"
					d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
				/></svg
			>Sign up with Google
			<div /></button
		>
	</div>
</div>
