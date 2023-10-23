<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { GroupChatDto, PlayerStatusDto } from '$lib/dtos';
	import ListButton from '../lists/ListButton.svelte';

	const dispatch = createEventDispatcher();

	export let historyList: GroupChatDto[];
</script>

<div class="flex-auto w-full flex flex-col overflow-auto rounded-lg mb-2">
	{#each historyList as history}
		<div
			class="border-b border-white border-opacity-20 p-1 flex flex-row gap-2 items-center justify-between"
		>
			<button
				class="items-start w-0 flex flex-col flex-1 hover:bg-white hover:bg-opacity-20 rounded-md h-full justify-center p-2"
				on:click={() => dispatch('select', history.id)}
			>
				<p class="text-start w-full truncate">{history.name}</p>
				<p class="text-gray-500 text-xs">{history.visibility}</p>
			</button>
			<div class="flex flex-row items-center gap-1 text-center text-xs justify-end flex-wrap">
				<!-- ??? Se quando não for membro, ao clicar no nome vai entrar automaticamente no grupo, não devo colocar um botão de join? -->
				<!-- TODO: decidir os botões e as condições para tal-->
				<ListButton on:click={() => dispatch('join', history.id)} type="join" />
			</div>
		</div>
	{/each}
</div>
