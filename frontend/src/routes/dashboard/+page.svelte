<script lang="ts">
	import { goto } from '$app/navigation';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import Button from '$lib/components/Button.svelte';

	let qrcode;

	function onSubmit() {
		goto('http://localhost:3001/');
	}
</script>

<PongHeader />
<div class="w-2/3 mx-auto">
	<div class="gap-5 flex flex-col justify-center pt-10 items-center">
		<p class="text-xl mt-20 mb-10">Dashboard</p>

		<Button type="stats" />
		<Button type="history" />
		<Button type="settings" />
		<Button type="play" />
	</div>
</div>
