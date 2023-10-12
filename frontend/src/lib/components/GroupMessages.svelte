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

	type GroupBase = {
		id: string;
		name: string;
		visibility: 'public' | 'private' | 'protected';
	};

	type GroupPreview = GroupBase & {
		membersLength: number;
	};

	type Group = GroupBase & {
		members: GroupMember[];
		messages: Message[];
	};

	export let group: Group | null;

	// function getAuthorName(authorId: string) {
	// 	let authorName = '';
	// 	for (let i = 0; i < group.members.length; i++) {
	// 		if (group.members[i].id === authorId) {
	// 			authorName = group.members[i].name;
	// 			break;
	// 		}
	// 	}
	// 	return authorName;
	// }
</script>

<div class="w-full h-full flex flex-row gap-10">
	<div class="border-4 border-white w-full h-full flex flex-col">
		{#if group == null}
			<!-- TODO: Tela de "Selecione uma conversa" -->
			null
		{:else}
			<div class="border-2 border-white h-10 m-2 flex items-center justify-center">
				<p class="text-xs text-center">{group.name}</p>
			</div>
			<div
				class="border-2 border-white h-full m-2 flex flex-col gap-5 items-start p-5 justify-start"
			>
				{#each group.messages as message}
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
			<div class="border-2 border-white m-2 flex items-center justify-center bg-white">
				<input placeholder="Enter the Message" class="text-center" />
			</div>
		{/if}
	</div>
	<div class="border-4 border-white h-full flex flex-col flex-none w-1/3">
		MEMBERS
		{#if group}
			{#each group.members as member}
				<div>
					{member.name}
				</div>
			{/each}
		{/if}
	</div>
</div>
