<script lang="ts">
	import type { ComponentMessage } from '$lib/dtos';
	import { selectedDirect } from '$lib/stores';
	import { formatDistanceToNow, parseISO } from 'date-fns';

	export let messages: ComponentMessage[] | null;

	export let sendMessage: (message: string) => void;

	let onSendMessage = () => {
		sendMessage(message);
		message = '';
	};

	let message: string = '';
</script>

<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl">
	{#if messages == null}
		<!-- TODO: Tela de "Selecione uma conversa" -->
		null
	{:else}
		<div class="border-2 border-white h-10 m-2 flex items-center justify-center rounded-md">
			<p class="text-xs text-center">{$selectedDirect?.nickname}</p>
		</div>
		<div
			class="border-2 border-white h-full m-2 flex flex-col gap-5 items-start p-5 justify-start rounded-md overflow-auto"
		>
			{#each messages as conversation}
				<div class="w-full flex flex-row justify-between">
					<div>
						<p>
							{conversation.nickname} -
							{formatDistanceToNow(
								new Date(
									parseISO(conversation.createdAt).getTime() -
										parseISO(conversation.createdAt).getTimezoneOffset() * 60 * 1000
								)
							)}
							ago
						</p>
						<p>
							{conversation.message}
						</p>
					</div>
					<p>
						{#if !conversation.sync}
							Loading
						{:else}
							Recieved
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
	{/if}
</div>
