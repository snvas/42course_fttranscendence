<script lang="ts">
	let lineClass = 'bg-white h-3 w-full';
	let chunkClass = 'flex flex-col gap-4 w-full';
</script>

<div class="gap-20 w-full flex flex-col pt-10 items-center mb-4">
	<div class="w-full flex flex-row gap-10 items-center">
		<div class={chunkClass}>
			<div class={lineClass} />
			<div class={lineClass} />
		</div>
		<p class="text-5xl">PONG</p>
		<div class={chunkClass}>
			<div class={lineClass} />
			<div class={lineClass} />
		</div>
	</div>
</div>
