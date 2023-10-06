<script>
	import FriendStatus from './FriendStatus.svelte';
</script>

<div class="border-4 border-white min-w-fit w-full h-full flex flex-col ">
	<div class="flex-none flex flex-row">
		<div class="border-4 border-white h-10 w-1/2 m-2 flex items-center justify-center">
			<p>FRIENDS</p>
		</div>
		<div class="border-4 border-white h-10 w-1/2 m-2 flex items-center justify-center">
			<p class="">CHAT</p>
		</div>
	</div>
	<div class="flex-1">
		<FriendStatus />
	</div>
	<div class="border-4 border-white h-10 m-2 flex items-center justify-center flex-none">
		<p>ADD FRIEND +</p>
	</div>
</div>
