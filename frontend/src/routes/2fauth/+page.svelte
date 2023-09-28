<script lang="ts">
	import { goto } from '$app/navigation';
	import PongHeader from '$lib/components/PongHeader.svelte';
		
	let qrcode;

	function onSubmit() {
		goto('http://localhost:3001/');
		
	}
</script>

<PongHeader/>
<div class="w-2/3 mx-auto">
	<div class="gap-5 flex flex-col pt-10 items-center">
		<p class="text-xl mt-20 mb-10">Scan QR Code with an Authentication App!</p>

		<img class="qrcode" src={qrcode} alt="d" />
		
		<input placeholder="Enter the Code" class="input-primary" />
				<button class="btn-primary w-1/4" on:click={onSubmit}> Register </button>
			</div>
</div>
