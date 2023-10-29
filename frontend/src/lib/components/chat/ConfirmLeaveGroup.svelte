<script lang="ts">
	import type { GroupChatDto } from '$lib/dtos';
	import { selectedGroup } from '$lib/stores';

	export let confirmLeave: GroupChatDto | null;
	export let leaveGroup: (chatId: number, password?: string) => Promise<void | number>;

	const alerts = {
		none: '',
		cant: "you can't leave this group"
	};

	let alert = alerts['none'];

	async function onLeaveGroup() {
		if (confirmLeave == null) return;

		alert = alerts['none'];

		let response = await leaveGroup(confirmLeave!.id);

		if (typeof response === 'number') {
			if (response == 406) {
				alert = alerts['cant'];
				return;
			}
			console.log(response);
		} else {
			$selectedGroup = null;
			confirmLeave = null;
		}
	}

	$: confirmLeave, (alert = alerts['none']);
</script>
<div class="h-full w-full border-4 rounded-3xl items-center justify-center flex flex-col">
<form>
	{#if confirmLeave}
	<h1 class="pb-10 text-center">Confirm to leave the group <br/>
		<span class="text-yellow-500 text-4xl">{confirmLeave.name}</span></h1>
		<p class="text-red-500 {alert != '' ? 'block' : 'invisible'}">{alert}</p>
		<button class="btn-primary" on:click={() => onLeaveGroup()}>CONFIRM</button>
	{/if}
</form>
</div>