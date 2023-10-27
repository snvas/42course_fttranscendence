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

<form class="h-full w-full">
	{#if confirmLeave}
		<h1>Confirm leave group {confirmLeave.name}</h1>
		<p class="text-red-500 {alert != '' ? 'block' : 'invisible'}">{alert}</p>
		<button class="btn-primary" on:click={() => onLeaveGroup()}>CONFIRM</button>
	{/if}
</form>
