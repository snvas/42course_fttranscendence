<script lang="ts">
	import type { PlayerStatusDto } from '$lib/dtos';
	import type { AxiosResponse } from 'axios';
	import { goto } from '$app/navigation';
	import AvatarImage from './AvatarImage.svelte';
	import { createEventDispatcher, setContext } from 'svelte';

	export let users: PlayerStatusDto[];
	export let getAvatar: (avatarId: number | null) => Promise<AxiosResponse<Blob> | null> | null;

	const dispatch = createEventDispatcher();

</script>

<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl pb-2">
	<div class="flex-none flex justify-center p-3">
		<div class="w-full mx-auto min-w-fit mb-4 rounded-xl btn-users">USERS</div>
	</div>
	<div class="flex-1 w-full overflow-y-auto">
		{#each users as user}
			<div
				class="w-full border-b border-opacity-20 border-white flex flex-row p-2 gap-4 justify-between items-center"
			>
				<div class="flex flex-row gap-4 items-center">
					<div class="w-12">
						<AvatarImage avatar={getAvatar(user.avatarId ?? null)} />
					</div>
					<div class="flex flex-col justify-start">
						<p class="flex flex-col">{user.nickname}</p>
						<!-- {#if user.blocked}
					<div class="text-red-800 text-xs">Blocked</div>
				{:else}
					<p class=" text-green-600 text-xs">{user.status}</p>
					{#if user.friend}
						<div class="text-gray-600 text-xs">Friend</div>
					{/if}
				{/if} -->
					</div>
				</div>
				<div class="flex flex-row items-center gap-1 text-center text-xs justify-end flex-wrap">
					<!-- {#if !user.blocked}
				{#if !user.friend}
					<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
						<img src="/adicionar-usuario.png" alt="add friend" width="90%" />
						<p class="text-center">FRIEND</p>
					</button>
				{/if} -->
					<button
						class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1"
						on:click={() => dispatch('chat', user)}
					>
						<img src="/bate-papo-de-texto.png" alt="let's chat" />
						<p class="text-center">CHAT</p>
					</button>
					<button
						class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1"
						on:click={() => dispatch('block', user.id)}
					>
						<img src="/bloqueado.png" alt="block this user" width="90%" />
						<p class="text-center">BLOCK</p>
					</button>
					<button
						class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1"
						on:click={() => dispatch('play', user.id)}
					>
						<img src="/pingue-pongue.png" alt="let's play" />
						<p class="text-center">PLAY</p>
					</button>
					<!-- {:else}
				<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
					<img src="/bloqueado.png" alt="block this user" width="90%" />
					<p class="text-center">UNBLOCK</p>
				</button>
			{/if} -->
				</div>
			</div>
		{/each}
	</div>
</div>
