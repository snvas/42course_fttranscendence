<script lang="ts">
	
	import chatService from '$lib/api/services/ChatService';
	import type {
		GroupCreationDto,
		ComponentMessage
	} from '$lib/dtos';

	import { goto } from '$app/navigation';



	export let messages: ComponentMessage[] | null;

	// TODO: vai ser importado usando store
	type SelectedGroup = {
		name: string;
		id: number;
		members: {
			id: number;
			name: string;
		}[];
	};

	let selectedGroup: SelectedGroup = {
		name: 'triste teste',
		id: 200,
		members: [
			{
				id: 1,
				name: 'tristonho'
			}
		]
	};

	async function onCreateGroup() {
		//await GroupCreationDto;
		goto('/chat/group/create');
	}
</script>

<div class="w-full h-full flex flex-row gap-10 ">
	<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl p-5">
		{#if messages == null}
		<div class="flex flex-col w-full items-center gap-3 p-20">
			<p class="text-lg text-gray-400 flex">Nenhum grupo encontrado </p>
			<button class="btn-primary w-fit md:text-2xl text-xs p-6 flex" on:click={onCreateGroup}>Criar um Grupo</button>
		</div>
		{:else}
			<div class="border-2 border-white h-10 m-2 flex items-center justify-center">
				<p class="text-xs text-center">{selectedGroup.name}</p>
			</div>
			<div
				class="border-2 border-white h-full m-2 flex flex-col gap-5 items-start p-5 justify-start"
			>
				{#each messages as conversation}
					<div class="w-full flex flex-row justify-between">
						<div>
							<p>
								{conversation.nickname}
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
			<div class="border-2 border-white m-2 flex items-center justify-center bg-white">
				<input placeholder="Enter the Message" class="text-center" />
			</div>
		{/if}
	</div>
	<div class="border-4 border-white h-full flex flex-col flex-none w-1/3 p-5 rounded-3xl">
		MEMBERS
		{#if selectedGroup}
			{#each selectedGroup.members as member}
				<div>
					{member.name}
				</div>
			{/each}
		{/if}
	</div>
</div>
