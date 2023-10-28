<script lang="ts">
	import type { GroupChatDto } from '$lib/dtos';
	import { selectedGroup } from '$lib/stores';

	export let confirmJoin: GroupChatDto | null;
	export let joinGroup: (chatId: number, password?: string) => Promise<void | number>;

	const alerts = {
		none: '',
		empty: "can't be empty",
		wrong: 'wrong password'
	};

	let password: string = '';
	let alertPass = alerts['none'];

	async function onJoinGroup() {
		if (confirmJoin == null) return;

		alertPass = alerts['none'];

		if (confirmJoin!.visibility == 'private' && password == '') {
			alertPass = alerts['empty'];
			return;
		}

		let response;
		if (confirmJoin!.visibility == 'private') {
			response = await joinGroup(confirmJoin!.id, password);
		} else {
			response = await joinGroup(confirmJoin!.id);
		}

		if (typeof response === 'number') {
			if (response == 401) {
				alertPass = alerts['wrong'];
			} else {
				console.log(response);
			}
		} else {
			$selectedGroup = confirmJoin!;
			confirmJoin = null;
		}
	}

	$: confirmJoin, (alertPass = alerts['none']);
</script>


<div class="h-full w-full border-4 rounded-3xl items-center justify-center flex flex-col">
<form>
	
	{#if confirmJoin}
		<h1 class="pb-10 text-center">Confirm to Join Group <br/>
			<span class="text-yellow-500 text-4xl"> {confirmJoin.name}</span></h1>
		{#if confirmJoin.visibility == 'private'}
			<p class="text-red-500 {alertPass != '' ? 'block' : 'invisible'}">{alertPass}</p>
			<input
				class="input-primary {alertPass ? 'border-red-500' : ''}"
				type="text"
				bind:value={password}
				placeholder="password"
			/>
		{/if}
		<button class="btn-primary" on:click={() => onJoinGroup()}>CONFIRM</button>
	{/if}
</form>
</div>