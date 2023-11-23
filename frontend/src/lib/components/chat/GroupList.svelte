<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { GroupChatDto, GroupChatHistoryDto } from '$lib/dtos';
	import ListButton from '../lists/ListButton.svelte';
	import { profile, selectedGroup } from '$lib/stores';

	const dispatch = createEventDispatcher();

	export let allGroups: GroupChatDto[];
	export let myHistory: GroupChatHistoryDto[];

	let groups: (GroupChatDto & {
		belong: boolean;
		banned?: boolean;
	})[];

	function getGroupList(all: GroupChatDto[], history: GroupChatHistoryDto[]): typeof groups {
		return all.map((group) => {
			let belong: boolean;
			let banned: boolean;
			let thisGroupHistory = history.find((v) => v.id == group.id);
			if (thisGroupHistory) {
				belong = true;
				banned = thisGroupHistory.bannedMembers.find((m) => m.profile.id == $profile.id)
					? true
					: false;
			} else {
				belong = false;
				banned = false;
			}
			return {
				...group,
				belong,
				banned
			};
		});
	}

	$: groups = getGroupList(allGroups, myHistory);
</script>

<div class="flex-auto w-full flex flex-col overflow-auto rounded-lg mb-2">
	{#each groups as group}
		<div
			class="border-b border-white border-opacity-20 p-1 flex flex-row gap-2 items-center justify-between  {$selectedGroup?.id == group.id ? 'bg-[#570b0b]' : ''} "
		>
			<button
				class="items-start w-0 flex flex-col flex-1 enabled:hover:bg-white enabled:hover:bg-opacity-20 rounded-md h-full justify-center p-2"
				on:click={() => dispatch('select', group)}
				disabled={!group.belong || group.banned}
			>
				<p class="text-start w-full truncate">{group.name}</p>
				<p class="text-slate-500 text-xs">{group.visibility}</p>
			</button>
			<div class="flex flex-row items-center gap-1 text-center text-xs justify-end flex-wrap">
				{#if !group.banned}
					{#if !group.belong}
						<ListButton on:click={() => dispatch('join', group)} type="join" />
					{:else if group.owner.id != $profile.id}
						<ListButton on:click={() => dispatch('leave', group)} type="leave" />
					{/if}
				{:else}
				<div class="p-4 items-center flex gap-3"><i class="fa fa-ban text-2xl icon-link" aria-hidden="true" /> You are banned</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
