<script lang="ts">
	import type { GroupChatDto, GroupProfileDto, DashboardUsersList } from '$lib/dtos';
	import { profile, selectedGroup, playersStatus } from '$lib/stores';
	import type { AxiosResponse } from 'axios';
	import AvatarImage from '../AvatarImage.svelte';
	import ListButton from '../lists/ListButton.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let members: GroupProfileDto[];
	export let addMember: GroupChatDto | null;
	export let getAvatarFromId: (avatarId: number | null) => Promise<AxiosResponse<Blob, any> | null>;
	export let iAmAdminOrOwner: boolean;

	type GroupProfileStatus = GroupProfileDto & {
		status: string;
		isBlocked: boolean;
		isFriend: boolean;
	};

	const statusColor: { [index: string]: any } = {
		online: 'text-green-500',
		offline: 'text-gray-500',
		playing: 'text-yellow-500'
	};

	function joinMemberStatus(
		playersStatus: DashboardUsersList[],
		members: GroupProfileDto[]
	): GroupProfileStatus[] {
		return members.map((member) => {
			let user = playersStatus.find((user) => user.id == member.profile.id)!;

			return {
				...member,
				status: user.status,
				isBlocked: user.isBlocked,
				isFriend: user.isFriend
			};
		});
	}

	function itIsMyProfile(member: GroupProfileDto) {
		if ($profile.id == member.profile.id) {
			return true;
		}
		return false;
	}

	$: memberStatus = joinMemberStatus($playersStatus, members);

	// $: console.log(memberStatus);
</script>

<div
	class="border-4 border-white md:max-h-full max-h-96 flex flex-col flex-none p-2 rounded-3xl w-full"
>
	<p class="text-center pb-3">MEMBERS</p>
	<hr />
	<div class="overflow-y-auto w-full max-w-full">
		{#each memberStatus as member}
			<div>
				<div class="flex flex-row w-full border-b border-white border-opacity-20 py-2">
					<div class="flex flex-row gap-1 xl:gap-2 items-center grow">
						<div class="w-8 flex-none">
							<AvatarImage avatar={getAvatarFromId(member.profile.avatarId ?? null)} />
						</div>
						<div class="flex-1 flex flex-col items-start w-0">
							<p
								class=" text-start text-sm w-full truncate {member.isMuted || member.isBanned
									? 'text-gray-500'
									: ''} "
							>
								{member.profile.nickname}
							</p>

							<div class="flex text-xs items-center gap-2">
								<p class="text-yellow-500">
									{$selectedGroup?.owner.id == member.profile.id ? 'owner' : member.role}
								</p>
								{#if member.isBlocked}
									<div class="text-red-800 text-xs">Blocked</div>
								{:else}
									<p class="{statusColor[member.status]} text-xs">{member.status}</p>
									{#if member.isFriend}
										<div class="text-yellow-600 text-xs">Friend</div>
									{/if}
								{/if}
								{#if member.isMuted}
									<p>muted</p>
								{:else if member.isBanned}
									<p>banned</p>
								{/if}
							</div>
						</div>
					</div>
					<div
						class="flex flex-row items-center gap-1 text-center text-xs justify-end flex-initial mr-2"
					>
						{#if !itIsMyProfile(member)}
							<ListButton on:click={() => dispatch('chat', member.profile.id)} type="chat" />
							{#if !($selectedGroup?.owner.id == member.profile.id)}
								{#if iAmAdminOrOwner && !member.isBanned}
									{#if $selectedGroup?.owner.id == $profile.id}
										{#if member.role == 'admin'}
											<ListButton
												on:click={() => dispatch('remove-admin', member.profile.id)}
												type="remove-admin"
											/>
										{:else}
											<ListButton
												on:click={() => dispatch('turn-admin', member.profile.id)}
												type="turn-admin"
											/>
										{/if}
									{/if}

									{#if member.role != 'admin' || $selectedGroup?.owner.id == $profile.id}
										{#if member.isMuted}
											<ListButton
												on:click={() => dispatch('unmute', member.profile.id)}
												type="unmute"
											/>
										{:else}
											<ListButton
												on:click={() => dispatch('mute', member.profile.id)}
												type="mute"
											/>
										{/if}

										<ListButton on:click={() => dispatch('kick', member.profile.id)} type="kick" />
										<ListButton on:click={() => dispatch('ban', member.profile.id)} type="ban" />
									{/if}
								{:else if iAmAdminOrOwner && member.isBanned}
									<ListButton on:click={() => dispatch('unban', member.profile.id)} type="unban" />
								{/if}
							{/if}
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
	{#if iAmAdminOrOwner}
		<div class="pt-10 flex items-center justify-center">
			<button
				class="btn-primary w-3/4 lg:w-full md:text-2xl text-xs flex justify-center h-fit flex-initial"
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
