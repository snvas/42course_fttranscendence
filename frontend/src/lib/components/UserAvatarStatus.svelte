<script lang="ts">
	import type { PlayerStatusDto } from '$lib/dtos';
	import type { AxiosResponse } from 'axios';
	import AvatarImage from './AvatarImage.svelte';

	export let user: PlayerStatusDto;
	export let getAvatar: (avatarId: number | null) => Promise<AxiosResponse<Blob> | null> | null;

	const statusColor: { [index: string]: any } = {
		online: 'text-green-500',
		offline: 'text-gray-500',
		playing: 'text-yellow-500'
	};
</script>

<div class="flex flex-row gap-4 items-center">
	<div class="w-12">
		<AvatarImage avatar={getAvatar(user.avatarId ?? null)} />
	</div>
	<div class="flex flex-col justify-start items-start">
		<p class="flex flex-col">{user.nickname}</p>
		<div class="flex items-center gap-2">
			<!-- {#if user.blocked}
				<div class="text-red-800 text-xs">Blocked</div>
				{:else} -->
			<p class="{statusColor[user.status]} text-xs">{user.status}</p>
			<!-- {#if user.friend} -->
			<!-- <div class="text-gray-600 text-xs">|</div>
			<div class="text-gray-600 text-xs">Friend</div> -->
			<!-- {/if} -->
			<!--{/if} -->
		</div>
	</div>
</div>
