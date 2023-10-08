<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import Chat from '$lib/components/Chat.svelte';
	import DirectMessages from '$lib/components/DirectMessages.svelte';
	import Messages from '$lib/components/Messages.svelte';
</script>

<div class="h-full min-h-screen w-screen flex flex-col md:h-screen gap-10">
	<div class="flex-none">
		<PongHeader />
	</div>
	<div class="flex flex-row gap-10 p-10">
	<div class="gap-15 flex flex-col md:w-1/3 w-full h-full">
	<DirectMessages/>
</div>
	<div class="gap-15 flex flex-col md:w-2/3 w-full h-full">
		<Messages/>
	</div>
</div>
</div>
