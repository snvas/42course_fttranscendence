<script lang="ts">
	import { goto } from '$app/navigation';
	import Image from '$lib/components/Image.svelte';
	import Camera from '$lib/components/Camera.svelte';
	let lineClass = 'bg-white h-3 w-full';
	let chunkClass = 'flex flex-col gap-4 w-full';
	
	let qrcode;

	function onSubmit() {
		goto('http://localhost:3001/');
		
	}
</script>

<div class="gap-20 flex flex-col pt-10 items-center">
	<div class="w-full flex flex-row gap-10 items-center">
		<div class={chunkClass}>
			<div class={lineClass} />
			<div class={lineClass} />
		</div>
		<p class="text-6xl">PONG</p>
		<div class={chunkClass}>
			<div class={lineClass} />
			<div class={lineClass} />
		</div>
	</div>
</div>
<div class="w-2/3 mx-auto">
	<div class="gap-5 flex flex-col pt-10 items-center">
		<p class="text-xl mt-20 mb-10">Scan QR Code with an Authentication App!</p>

		<img class="qrcode" src={qrcode} alt="d" />
		
		<input placeholder="Enter the Code" class="input-primary" />
				<button class="btn-primary w-1/4" on:click={onSubmit}> Register </button>
			</div>
</div>
