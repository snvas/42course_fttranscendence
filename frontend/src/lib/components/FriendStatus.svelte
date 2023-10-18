<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PlayerStatusDto } from '$lib/dtos';
	import type { AxiosResponse } from 'axios';
	import AvatarImage from './AvatarImage.svelte';

	type User = PlayerStatusDto & {
		friend: boolean;
		blocked: boolean;
	};

	export let user: User;

	export let getAvatar: (avatarId: number | null) => Promise<AxiosResponse<Blob> | null> | null;

	async function onChat() {
		goto('/chat');
	}
</script>

<div
	class="w-full border-b border-opacity-20 border-white flex flex-row p-2 gap-4 justify-between items-center"
>
	<div class="flex flex-row gap-4 items-center">
		<div class="w-12">
			<AvatarImage avatar={getAvatar(user.avatarId ?? null)} />
		</div>
		<div class="flex flex-col justify-start">
			<p class="flex flex-col">{user.nickname}</p>
			{#if user.blocked}
				<div class="text-red-800 text-xs">Blocked</div>
			{:else}
				<p class=" text-green-600 text-xs">{user.status}</p>
				{#if user.friend}
					<div class="text-gray-600 text-xs">Friend</div>
				{/if}
			{/if}
		</div>
	</div>
	<div class="flex flex-row items-center gap-1 text-center text-xs justify-end flex-wrap">
		{#if !user.blocked}
			{#if !user.friend}
				<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
					<img src="/adicionar-usuario.png" alt="add friend" width="90%" />
					<p class="text-center">FRIEND</p>
				</button>
			{/if}
			<button
				class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1"
				on:click={onChat}
			>
				<img src="/bate-papo-de-texto.png" alt="let's chat" />
				<p class="text-center">CHAT</p>
			</button>
			<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
				<img src="/bloqueado.png" alt="block this user" width="90%" />
				<p class="text-center">BLOCK</p>
			</button>
			<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
				<img src="/pingue-pongue.png" alt="let's play" />
				<p class="text-center">PLAY</p>
			</button>
		{:else}
			<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
				<img src="/bloqueado.png" alt="block this user" width="90%" />
				<p class="text-center">UNBLOCK</p>
			</button>
		{/if}
	</div>
</div>
