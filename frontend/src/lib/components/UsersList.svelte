<script lang="ts">
	import type { PlayerStatusDto } from '$lib/dtos';
	import type { AxiosResponse } from 'axios';
	import { createEventDispatcher } from 'svelte';
	import { profile } from '$lib/stores';
	import UserAvatarStatus from './UserAvatarStatus.svelte';

	export let users: PlayerStatusDto[];
	export let getAvatar: (avatarId: number | null) => Promise<AxiosResponse<Blob> | null> | null;
	export let loading: Promise<any>;
	const dispatch = createEventDispatcher();

	
</script>

<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl pb-2">
	<div class="flex-none flex justify-center p-3">
		<div class="w-full mx-auto min-w-fit mb-4 rounded-xl btn-users">USERS</div>
	</div>
	<div class="flex-1 w-full overflow-y-auto">
		{#await loading}
			Carregando
		{:then}
			{#each users as user}
				{#if user.id != $profile.id}
					<div
						class="w-full border-b border-opacity-20 border-white flex flex-row p-2 gap-4 justify-between items-center"
					>
						<UserAvatarStatus {user} {getAvatar}></UserAvatarStatus>
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
				{/if}
			{/each}
		{/await}
	</div>
</div>
