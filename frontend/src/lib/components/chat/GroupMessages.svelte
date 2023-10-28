<script lang="ts">
	import type { ComponentMessage, GroupChatDto } from '$lib/dtos';
	import { selectedGroup, profile } from '$lib/stores';
	import { formatDistanceToNow, parseISO } from 'date-fns';

	export let messages: ComponentMessage[] | null;

	export let configGroup: GroupChatDto | null;

	export let sendMessage: (message: string) => void;

	export let muted: boolean = false;

	let onSendMessage = () => {
		sendMessage(message);
		message = '';
	};

	let message: string = '';
</script>

<div class="w-full h-full flex flex-row gap-10">
	{#if messages == null || !$selectedGroup}
		<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl p-5">
			<div class="flex flex-col w-full items-center gap-3 p-20">
				<p class="text-lg text-gray-400 flex">No group selected</p>
			</div>
		</div>
	{:else}
		<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl p-3">
			{#if $profile.id == $selectedGroup.owner.id}
				<div class="flex flex-row justify-end gap-5 pr-3">
					<button class="text-green-200" on:click={() => (configGroup = $selectedGroup)}>
						<div class="fa fa-cog text-3xl icon-link text-slate-500" aria-hidden="true" />
					</button>
				</div>
			{/if}
			<div class="flex flex-row justify-center">
				<h1 class="text-center text-yellow-500">{$selectedGroup.name}</h1>
			</div>
			<div
				class="border-2 border-white h-full m-2 flex flex-col gap-5 items-start p-5 justify-start rounded-lg overflow-auto"
			>
				{#each messages as conversation}
					<div class="w-full flex flex-row justify-between">
						<div>
							<p class="text-xs text-gray-400">{conversation.nickname}</p>
							<p class="text-lg">
								{conversation.message}
							</p>
						</div>
						<p>
							{#if !conversation.sync}
								Loading
							{:else}
								<div class="flex flex-row items-center gap-3 text-xs text-gray-400">
									{formatDistanceToNow(
										new Date(
											parseISO(conversation.createdAt).getTime() -
												parseISO(conversation.createdAt).getTimezoneOffset() * 60 * 1000
										)
									)}
									ago
									<img src="/mensagem-recebida.png" class="w-10" alt="mensagem recebida" />
								</div>
							{/if}
						</p>
					</div>
				{/each}
			</div>
			<form
				class="flex-initial border-2 border-white m-2 flex items-center justify-center bg-white rounded-md h-16 gap-2 {muted
					? 'bg-gray-300 border-gray-300'
					: ''}"
			>
				<input
					bind:value={message}
					placeholder={muted ? 'You are muted' : 'Enter the Message'}
					class="text-center w-full h-full text-black text-xl
					disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500"
					disabled={muted}
				/>
				{#if !muted}
					<button
						class="bg-black p-3 rounded-md enabled:hover:bg-slate-500"
						on:click={onSendMessage}
					>
						SEND
					</button>
				{/if}
			</form>
		</div>
	{/if}
</div>
