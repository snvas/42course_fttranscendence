<script lang="ts">
	import type { PrivateMessageHistoryDto } from "$lib/dtos";

	export let direct: PrivateMessageHistoryDto | null;
</script>

<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl">
	{#if direct == null}
		<!-- TODO: Tela de "Selecione uma conversa" -->
		null
	{:else}
		<div class="border-2 border-white h-10 m-2 flex items-center justify-center rounded-md">
			<p class="text-xs text-center">{direct.nickname}</p>
		</div>
		<div class="border-2 border-white h-full m-2 flex flex-col gap-5 items-start p-5 justify-start rounded-md">
			{#each direct.messages as conversation}
				<div>
					<p>
						<!--TODO:  Verificar se authorid é do usuário -->
						{conversation.sender.nickname == '0' ? 'Me' : conversation.sender.nickname}
					</p>
					<p>
						{conversation.message}
					</p>
				</div>
			{/each}
		</div>
		<div class="border-2 border-white m-2 flex items-center justify-center bg-white rounded-md h-16">
			<input placeholder="Enter the Message" class="text-center w-full h-full text-black text-xl" />
		</div>
	{/if}
</div>
