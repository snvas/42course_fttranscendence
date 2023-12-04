<script lang="ts">
	import type { ComponentMessage } from '$lib/dtos';
	import { selectedDirect } from '$lib/stores';
	import { validateMessage } from '$lib/utils';
	import { formatDistanceToNow, parseISO } from 'date-fns';

	export let messages: ComponentMessage[] | null;

	export let blocked: boolean;

	export let sendMessage: (message: string) => void;

	let alert: string | null = null;
	const maxSize = 200;

	let onSendMessage = () => {
		if (message != '') {
			let validated = validateMessage(message);
			if (validated == true) {
				sendMessage(message);
				message = '';
			} else {
				alert = validated;
			}
		}
	};
	let message: string = '';

	$: message, (alert = null);
	$: count = message.length;
</script>

<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl p-2 gap-2">
	{#if messages == null}
		<div class="flex flex-col w-full items-center gap-3 p-20">
			<p class="text-lg text-gray-400 flex">no conversation selected</p>
		</div>
	{:else}
		<div class="border-2 border-white h-10 flex items-center justify-center rounded-md">
			<p class="lg:text-lg text-sm text-center">{$selectedDirect?.nickname}</p>
		</div>
		<div
			class="border-2 border-white h-full flex flex-col gap-5 items-start p-5 justify-start rounded-lg overflow-auto w-full"
		>
			{#each messages as conversation}
				<div class="flex flex-row w-full gap-2 border-b border-white border-opacity-20">
					<div class="flex flex-col grow w-0">
						<p class="text-xs text-gray-400">{conversation.nickname}</p>
						<p class="text-lg break-words font-roboto">
							{conversation.message}
						</p>
						<div class="flex flex-row w-full justify-end text-xs text-gray-400">
							{#if !conversation.sync}
								Loading
							{:else if conversation.blocked}
								<div class="text-red-500">Message not sent, you are blocked by this user</div>
							{:else}
								<div class="flex flex-row items-center gap-1">
									<p>
										{formatDistanceToNow(
											new Date(
												parseISO(conversation.createdAt).getTime()
											)
										)}
										ago
									</p>
									<img class="w-8" src="/mensagem-recebida.png" alt="mensagem recebida" />
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
		<div class="flex flex-col">
			<div class="flex flex-row justify-between text-xs">
				<p class="text-red-500 {alert ? 'block' : 'invisible'}">{alert}</p>
				<p class="transition-all {count > maxSize ? 'text-red-500' : 'text-gray-500'}">
					{count} / {maxSize}
				</p>
			</div>
			<form
				class="flex-initial border-2 border-white flex items-center justify-center bg-white rounded-md h-16 gap-2 {blocked
					? 'bg-gray-300 border-gray-300'
					: ''}"
			>
				<input
					bind:value={message}
					placeholder={blocked ? 'You blocked this user' : 'Enter the Message'}
					class="text-center w-full h-full text-black text-xl
					disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500"
					disabled={blocked}
				/>
				{#if !blocked}
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
