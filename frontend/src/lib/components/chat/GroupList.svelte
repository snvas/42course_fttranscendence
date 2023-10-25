<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { GroupChatDto, GroupChatHistoryDto, PlayerStatusDto } from '$lib/dtos';
	import ListButton from '../lists/ListButton.svelte';

	const dispatch = createEventDispatcher();

	export let allGroups: GroupChatDto[];
	export let myHistory: GroupChatHistoryDto[];

	let groups: (GroupChatDto & {
		belong: boolean;
	})[];

	function getGroupList(all: GroupChatDto[], history: GroupChatHistoryDto[]): typeof groups {
		return all.map((group) => {
			let belong = history.find((v) => v.id == group.id) ? true : false;
			return {
				...group,
				belong
			};
		});
	}

	$: groups = getGroupList(allGroups, myHistory);
	$: console.log('groups', groups);
</script>

<div class="flex-auto w-full flex flex-col overflow-auto rounded-lg mb-2">
	{#each groups as group}
		<div
			class="border-b border-white border-opacity-20 p-1 flex flex-row gap-2 items-center justify-between"
		>
			<button
				class="items-start w-0 flex flex-col flex-1 enabled:hover:bg-white enabled:hover:bg-opacity-20 rounded-md h-full justify-center p-2"
				on:click={() => dispatch('select', group)}
				disabled={!group.belong}
			>
				<p class="text-start w-full truncate">{group.name}</p>
				<p class="text-gray-500 text-xs">{group.visibility}</p>
			</button>
			<div class="flex flex-row items-center gap-1 text-center text-xs justify-end flex-wrap">
				<!-- TODO: decidir os botões e as condições para tal-->
				{#if !group.belong}
					<ListButton on:click={() => dispatch('join', group)} type="join" />
				{:else}
					<ListButton on:click={() => dispatch('leave', group.id)} type="leave" />
				{/if}
			</div>
		</div>
	{/each}
</div>
