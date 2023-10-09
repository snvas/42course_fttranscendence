<script lang="ts">
	type User = {
		id: string;
		avatarId: string;
		name: string;
		status: 'Online' | 'Offline' | 'Playing';
	};

	type Message = {
		name: string;
		authorId: User['id'];
		date: string;
		message: string;
	};

	export let messages: Message[];
	export let users: User[];

	function getAuthorName(authorId: string) {
		let authorName = '';
		for (let i = 0; i < users.length; i++) {
			if (users[i].id === authorId) {
				authorName = users[i].name;
				break;
			}
		}
		return authorName;
	}
</script>

<div class="border-4 border-white w-full h-full flex flex-col">
	<div class="border-2 border-white h-10 m-2 flex items-center justify-center">
		<p class="text-xs text-center">Direct Messages</p>
	</div>
	<div class="border-2 border-white h-full m-2 flex flex-col gap-5 items-start p-5 justify-start">
		{#each messages as message}
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
</div>
