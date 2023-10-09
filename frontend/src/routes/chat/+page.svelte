<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import DirectMessages from '$lib/components/DirectMessages.svelte';
	import Messages from '$lib/components/Messages.svelte';

	type Message = {
		id: string;
		name: string;
		authorId: User['id'];
		date: Date;
		message: string;
	};

	type User = {
		id: string;
		avatarId: string;
		name: string;
		status: 'Online' | 'Offline' | 'Playing';
	};

	type GroupMember = User & {
		role: 'admim' | 'owner' | 'member';
	};

	type Group = {
		id: string;
		name: string;
		messages: Message[];
		members: GroupMember[];
	};

	let directMessages: Message[] = [
		{
			id: '1',
			name: 'Fulano',
			authorId: '100',
			date: new Date(),
			message: 'asdasdasdasdasdas asd asd asd asd asd asd asd'
		},
		{
			id: '2',
			name: 'Ciclano',
			authorId: '101',
			date: new Date(),
			message: 'Olá, como você está?'
		},
		{
			id: '3',
			name: 'Beltrano',
			authorId: '102',
			date: new Date(),
			message: 'Tenho uma pergunta para você.'
		}
	];

	let groups: Group[] = [
		{
			id: '401',
			name: 'Grupo de Trabalho',
			messages: [
				{
					id: '4',
					name: 'Alice',
					authorId: '201',
					date: new Date(),
					message: 'Vamos discutir o projeto hoje à tarde?'
				},
				{
					id: '5',
					name: 'Bob',
					authorId: '202',
					date: new Date(),
					message: 'Sim, às 14h é bom para todos?'
				}
			],
			members: [
				{
					id: '201',
					avatarId: 'avatar-201',
					name: 'Alice',
					status: 'Online',
					role: 'owner'
				},
				{
					id: '202',
					avatarId: 'avatar-202',
					name: 'Bob',
					status: 'Offline',
					role: 'member'
				}
			]
		}
	];
</script>

<div class="h-full min-h-screen w-screen flex flex-col md:h-screen gap-10">
	<div class="flex-none">
		<PongHeader />
	</div>
	<div class="flex flex-col justify-end items-end">
		<a href="/dashboard"
			><i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" /></a
		>
	</div>
	<div class="flex flex-row gap-10 p-10">
		<div class="gap-15 flex flex-col md:w-1/3 w-full h-full">
			<DirectMessages />
		</div>
		<div class="gap-15 flex flex-col md:w-2/3 w-full h-full">
			<Messages />
		</div>
	</div>
</div>

<style>
	.icon-link {
		color: whitesmoke;
	}
</style>
