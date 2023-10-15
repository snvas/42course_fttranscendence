<script>
	import FriendStatus from './FriendStatus.svelte';
</script>

<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl pb-2">
	<div class="flex-none flex justify-center p-3">
		<div class="w-full mx-auto min-w-fit mb-4 rounded-xl btn-users">USERS</div>
	</div>
	<div class="flex-1 w-full overflow-y-auto">
		<FriendStatus />
	</div>
</div>
