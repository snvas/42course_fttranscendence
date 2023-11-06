<script>
	export let levelPercentage = 0;
</script>


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

<div
			class="container w-full min-w-fit flex border-4 border-white justify-center items-center rounded-md h-10"
		>
		<div class="filler bg-green-700" style="width: {levelPercentage}%"></div>
			<!-- TODO: level? -->
			<p class="text-white  z-10">LEVEL 2 - {levelPercentage}%</p>
		</div>
