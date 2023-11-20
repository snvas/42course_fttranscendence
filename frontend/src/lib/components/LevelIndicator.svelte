<script>
	export let levelPercentage = 0;
	export let level = 0;
</script>

<div
	class="container w-full min-w-fit flex border-4 border-white justify-center items-center rounded-md h-10"
>
	<div class="filler bg-green-700 -z-10" style="width: {levelPercentage}%" />
	<p class="text-white">LEVEL {level} - {levelPercentage}%</p>
</div>

<style>
	.container {
		position: relative;
	}

	.filler {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
	}
</style>
