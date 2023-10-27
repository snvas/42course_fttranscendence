<script lang="ts">
	import type { GroupChatDto, GroupProfileDto, PlayerStatusDto } from '$lib/dtos';
	import { onlineUsers, profile, selectedGroup } from '$lib/stores';
	import type { AxiosResponse } from 'axios';
	import AvatarImage from '../AvatarImage.svelte';
	import ListButton from '../lists/ListButton.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let members: GroupProfileDto[];
	export let addMember: GroupChatDto | null;
	export let getAvatarFromId: (avatarId: number | null) => Promise<AxiosResponse<Blob, any> | null>;

	type GroupProfileStatus = GroupProfileDto & {
		status: string;
	};

	const statusColor: { [index: string]: any } = {
		online: 'text-green-500',
		offline: 'text-gray-500',
		playing: 'text-yellow-500'
	};

	function joinMemberStatus(
		online: PlayerStatusDto[],
		members: GroupProfileDto[]
	): GroupProfileStatus[] {
		return members.map((member) => {
			let onlineUser = online.find((user) => user.id == member.profile.id) ?? null;
			if (onlineUser) {
				return {
					...member,
					status: onlineUser.status
				};
			} else {
				return {
					...member,
					status: 'offline'
				};
			}
		});
	}

	function iAmAdminOrOwner(selected: GroupChatDto | null): boolean {
		if ($profile.id == selected?.owner.id) {
			return true;
		}
		return false;
		// TODO: implementar verificação de admin
	}

	function itIsMyProfile(member: GroupProfileDto) {
		if ($profile.id == member.profile.id) {
			return true;
		}
		return false;
	}

	$: memberStatus = joinMemberStatus($onlineUsers, members);

	$: console.log(memberStatus);
</script>

<div class="border-4 border-white h-full flex flex-col flex-none w-1/3 p-5 rounded-3xl">
	MEMBERS
	<div class="overflow-auto">
		{#each memberStatus as member}
			<div>
				<div class="flex flex-row w-full border-b py-2">
					<div class="flex flex-row gap-1 xl:gap-4 items-center grow">
						<div class="w-12 flex-none">
							<AvatarImage avatar={getAvatarFromId(member.profile.avatarId ?? null)} />
						</div>
						<div class="flex-1 flex flex-col items-start w-0">
							<p class=" text-start w-full truncate">{member.profile.nickname}</p>

							<div class="flex items-center gap-2">
								<!-- {#if member.blocked}
								<div class="text-red-800 text-xs">Blocked</div>
								{:else} -->
								<p class="{statusColor[member.status]} text-xs">{member.status}</p>
								{member.role}

								<!-- {#if user.friend} -->
								<!-- <div class="text-gray-600 text-xs">|</div>
									<div class="text-gray-600 text-xs">Friend</div> -->
								<!-- {/if} -->
								<!--{/if} -->
								{#if member.isMuted}
									<p>Muted</p>
								{/if}
							</div>
						</div>
					</div>
					<div
						class="flex flex-row items-center gap-1 text-center text-xs justify-end flex-initial"
					>
						{#if !itIsMyProfile(member)}
							<!-- TODO: turn admin, mute, kick, ban -->
							{#if iAmAdminOrOwner($selectedGroup)}
								<ListButton on:click={() => dispatch('kick', member.profile.id)} type="kick" />
							{/if}
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
	{#if iAmAdminOrOwner($selectedGroup)}
		<div>
			<button
				class="btn-primary w-full md:text-2xl text-xs flex justify-center h-fit flex-initial"
				on:click={() => {
					if (!addMember) {
						addMember = $selectedGroup;
					} else {
						addMember = null;
					}
				}}
			>
				{addMember ? 'CONFIRM' : 'ADD USER'}
			</button>
		</div>
	{/if}
</div>
