<script>
	import FriendStatus from './FriendStatus.svelte';
</script>

<div class="border-4 border-white min-w-fit w-full 
flex flex-col ">
	<div class="flex-none flex flex-row">
		<div class="border-2 border-white h-10 w-1/3 m-2 flex items-center justify-center">
			<p class="text-xs text-center">Direct Messages</p>
		</div>
		<div class="border-2 border-white h-10 w-1/3 m-2 flex items-center justify-center">
			<p class="">Groups</p>
		</div>
		<div class="border-2 border-white h-10 w-1/3 m-2 flex items-center justify-center">
			<p class="">Friends</p>
		</div>
	</div>
	<div class="flex-1">
		<FriendStatus />
	</div>
</div>
