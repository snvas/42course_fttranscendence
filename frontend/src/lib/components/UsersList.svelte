<script>
	import FriendStatus from './FriendStatus.svelte';
</script>

<div class="border-4 border-white min-w-fit w-full h-full flex flex-col rounded-3xl">
	<div class="flex-none flex justify-center p-3">
		<div class="w-full mx-auto min-w-fit mb-4 rounded-xl btn-users">USERS</div>
	</div>
	<div class="flex-1 w-full">
		<FriendStatus />
	</div>
	<div class="border-4 border-white h-20 m-2 flex items-center justify-center flex-none rounded-xl bg-[#38761d] hover:bg-[#5bb72b]">
		<p class="text-3xl">ADD FRIEND +</p>
	</div>
</div>
