<script lang="ts">
	import { getAvatarFromId } from '$lib/api';
	import type { PlayerStatusDto, GroupProfileDto, GroupChatDto } from '$lib/dtos';
	import { playersStatus } from '$lib/stores';
	import UserAvatarStatus from '../UserAvatarStatus.svelte';
	import ListButton from '../lists/ListButton.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let members: GroupProfileDto[] = [];
	export let addMember: GroupChatDto | null;

	type PlayerMember = PlayerStatusDto & {
		role: string | null;
	};

	function listAllUsers(players: PlayerStatusDto[], members: GroupProfileDto[]): PlayerMember[] {
		return players.map((player) => {
			let member = members.find((member) => member.profile.id == player.id);
			return {
				...player,
				role: member?.role ?? null
			};
		});
	}

	$: addMemberList = listAllUsers($playersStatus, members);
</script>

<div class="w-full h-full flex flex-row gap-10 lg:w-1/2">
	<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl p-5">
		<div class="flex flex-col justify-end items-end">
			<button on:click={() => (addMember = null)}>
				<i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" />
			</button>
		</div>
		<div class="w-full h-full flex flex-col rounded-3xl overflow-y-auto">
			{#each addMemberList as member}
				<div class="flex flex-row border-b">
					<div class="p-2 grow">
						<UserAvatarStatus user={member} getAvatar={getAvatarFromId} />
					</div>
					<div>
						{#if member.role == null}
							<ListButton on:click={() => dispatch('add', member.id)} type="add-member" />
						{:else}
						<div class="fa fa-user-circle p-5 text-2xl icon-link" aria-hidden="true" />
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
