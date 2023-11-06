<script lang="ts">
	import type { DashboardUsersList } from '$lib/dtos';
	import type { AxiosResponse } from 'axios';
	import AvatarImage from './AvatarImage.svelte';

	export let user: DashboardUsersList;
	export let getAvatar: (avatarId: number | null) => Promise<AxiosResponse<Blob> | null> | null;

	const statusColor: { [index: string]: any } = {
		online: 'text-green-500',
		offline: 'text-gray-500',
		playing: 'text-yellow-500'
	};
</script>

<div class="flex flex-row gap-1 xl:gap-4 items-center">
	<div class="w-12 flex-none">
		<AvatarImage avatar={getAvatar(user.avatarId ?? null)} />
	</div>
	<div class="flex-1 flex flex-col items-start w-0">
		<p class=" text-start w-full truncate">{user.nickname}</p>

		<div class="flex items-center gap-2">
			{#if user.isBlocked}
				<div class="text-red-800 text-xs">Blocked</div>
			{:else}
				<p class="{statusColor[user.status]} text-xs">{user.status}</p>
				{#if user.isFriend}
					<div class="text-gray-600 text-xs">|</div>
					<div class="text-yellow-600 text-xs">Friend</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
