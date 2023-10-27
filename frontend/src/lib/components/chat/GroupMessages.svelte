<script lang="ts">
	import type { ComponentMessage, GroupChatDto } from '$lib/dtos';
	import { selectedGroup, profile } from '$lib/stores';
	import { formatDistanceToNow, parseISO } from 'date-fns';

	export let messages: ComponentMessage[] | null;

	export let configGroup: GroupChatDto | null;

	export let sendMessage: (message: string) => void;

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
				<p class="text-lg text-gray-400 flex">any group selected</p>
			</div>
		</div>
	{:else}
		<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl p-5">
			<div>
				{$selectedGroup.name}
				{#if $profile.id == $selectedGroup.owner.id}
				<button class="text-green-200" on:click={() => (configGroup = $selectedGroup)}>
					<!-- TODO : adicionar botão e formatar -->
					<!-- <div class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" /> -->
					Config
				</button>
				{/if}
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
				class="flex-initial border-2 border-white m-2 flex items-center justify-center bg-white rounded-md h-16 gap-2"
			>
				<input
					bind:value={message}
					placeholder="Enter the Message"
					class="text-center w-full h-full text-black text-xl"
				/>
				<button class="bg-black p-3 rounded-md hover:bg-slate-500" on:click={onSendMessage}>
					SEND
				</button>
			</form>
		</div>
	{/if}
</div>
