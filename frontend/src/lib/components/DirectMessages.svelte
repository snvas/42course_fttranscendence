<script lang="ts">
	type Message = {
		name: string;
		authorId: User['id'];
		date: string;
		message: string;
	};

	type User = {
		id: string;
		avatarId: string;
		name: string;
		status: 'Online' | 'Offline' | 'Playing';
		blocked?: true;
	};

	type DirectPreview = User;

	type Direct = DirectPreview & {
		messages: Message[];
	};

	type GroupMember = User & {
		role: 'admin' | 'owner' | 'member';
	};

	type GroupPreview = {
		id: string;
		name: string;
		visibility: 'public' | 'private' | 'protected';
		members: number;
	};

	type Group = GroupPreview & {
		members: GroupMember[];
		messages: Message[];
	};

	export let direct: Direct | null;
</script>

<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl">
	{#if direct == null}
		<!-- TODO: Tela de "Selecione uma conversa" -->
		null
	{:else}
		<div class="border-2 border-white h-10 m-2 flex items-center justify-center rounded-md">
			<p class="text-xs text-center">{direct.name}</p>
		</div>
		<div class="border-2 border-white h-full m-2 flex flex-col gap-5 items-start p-5 justify-start rounded-md">
			{#each direct.messages as message}
				<div>
					<p>
						<!--TODO:  Verificar se authorid é do usuário -->
						{message.authorId == '0' ? 'Me' : message.name}
					</p>
					<p>
						{message.message}
					</p>
				</div>
			{/each}
		</div>
		<div class="border-2 border-white m-2 flex items-center justify-center bg-white rounded-md h-16">
			<input placeholder="Enter the Message" class="text-center w-full h-full text-black text-xl" />
		</div>
	{/if}
</div>
