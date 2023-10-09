<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import FriendStatus from '$lib/components/FriendStatus.svelte';
	import Messages from '$lib/components/Messages.svelte';

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

	let directChats: User[] = [
		{
			id: '1',
			avatarId: '../../camera.png',
			name: 'Usuário 1',
			status: 'Online'
		},
		{
			id: '2',
			avatarId: '../../rapido.png',
			name: 'Usuário 2',
			status: 'Offline'
		},
		{
			id: '3',
			avatarId: '../../rapido.png',
			name: 'Usuário 3',
			status: 'Playing'
		},
		{
			id: '4',
			avatarId: '../../rapido.png',
			name: 'Usuário 4',
			status: 'Online'
		},
		{
			id: '5',
			avatarId: '../../rapido.png',
			name: 'Usuário 5',
			status: 'Offline'
		}
	];

	let directMessages = {
		'1': [
			{
				name: 'Usuário 1',
				authorId: '1',
				date: '0',
				message: 'Olá, como você está?'
			},
			{
				name: 'Usuário 1',
				authorId: '1',
				date: '0',
				message: 'Como foi o seu dia?'
			}
		],
		'2': [
			{
				name: 'Usuário 2',
				authorId: '0',
				date: '0',
				message: 'Qual é o seu plano para hoje?'
			},
			{
				name: 'Usuário 2',
				authorId: '2',
				date: '0',
				message: 'Vamos marcar algo para o próximo fim de semana?'
			},
			{
				name: 'Usuário 2',
				authorId: '0',
				date: '0',
				message: 'Tenha um bom dia!'
			}
		],
		'3': [
			{
				name: 'Usuário 3',
				authorId: '0',
				date: '0',
				message: 'Estou ansioso para o fim de semana!'
			},
			{
				name: 'Usuário 3',
				authorId: '3',
				date: '0',
				message: 'Você viu as últimas notícias?'
			}
		],
		'4': [
			{
				name: 'Usuário 4',
				authorId: '0',
				date: '0',
				message: 'Como está o tempo hoje?'
			},
			{
				name: 'Usuário 4',
				authorId: '4',
				date: '0',
				message: 'Que filme você recomenda assistir?'
			}
		],
		'5': [
			{
				name: 'Usuário 5',
				authorId: '5',
				date: '0',
				message: 'Vamos discutir o projeto hoje à tarde?'
			},
			{
				name: 'Usuário 5',
				authorId: '0',
				date: '0',
				message: 'Como foi o seu dia?'
			},
			{
				name: 'Usuário 5',
				authorId: '0',
				date: '0',
				message: 'Qual é o seu plano para hoje?'
			}
		]
	};

	let groups: Group[] = [
		{
			id: '401',
			name: 'Grupo de Trabalho',
			messages: [
				{
					name: 'Alice',
					authorId: '201',
					date: '0',
					message: 'Vamos discutir o projeto hoje à tarde?'
				},
				{
					name: 'Bob',
					authorId: '202',
					date: '0',
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

	function showMessages(userID: keyof typeof directMessages) {
		messages = directMessages[userID];
	}
	let messages: Message[] = directMessages[1];
	let showingMessages: 'direct' | 'groups' = 'direct';
</script>

<div class="h-full min-h-screen w-screen flex flex-col md:h-screen gap-10">
	<div class="flex-none">
		<PongHeader />
	</div>
	<div class="flex flex-col justify-end items-end">
		<a href="/dashboard">
			<i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" />
		</a>
	</div>
	<div class="flex flex-col md:flex-row gap-10 p-10 h-full">
		<div class="gap-15 flex flex-col md:w-1/4 flex-none w-full h-full">
			<div class="border-4 border-white min-w-fit w-full flex flex-col h-full">
				<div class="flex-none flex flex-row">
					<!-- TODO: padronizar botões e estilo baseado na variável "showingMessages" -->
					<button
						class="border-2 border-white h-10 w-1/3 m-2 flex items-center justify-center"
						on:click={() => (showingMessages = 'direct')}
					>
						<p class="text-xs text-center">Direct Messages</p>
					</button>
					<button
						class="border-2 border-white h-10 w-1/3 m-2 flex items-center justify-center"
						on:click={() => (showingMessages = 'groups')}
					>
						<p class="">Groups</p>
					</button>
					<!-- ??? remover aba de friends e manter apenas no dashboard? -->
					<div class="border-2 border-white h-10 w-1/3 m-2 flex items-center justify-center">
						<p class="">Friends</p>
					</div>
				</div>
				{#if showingMessages == 'direct'}
					{#each directChats as user}
						<button
							on:click={() => showMessages(user.id)}
							class="border-b-2 border-x-white h-12 m-2 flex flex-row"
						>
							<img
								class="avatar max-w-sm aspect-square w-10 h-10 m-2"
								src={user.avatarId}
								alt={user.name}
								title={user.name}
							/>
							<div class="flex flex-col ml-3">
								<p class="flex flex-col">{user.name}</p>
								<p class="flex flex-col text-green-600">{user.status}</p>
							</div>
						</button>
					{/each}
				{:else if showingMessages == 'groups'}
					<!-- TODO:  mensagens de grupo -->
					Mensagens de grupos
				{/if}
			</div>
		</div>
		{#if showingMessages == 'direct'}
			<div class="flex flex-col w-full h-full">
				<Messages bind:messages bind:users={directChats} />
			</div>
		{:else}
			<div class="flex flex-col w-full h-full">
				<Messages bind:messages bind:users={directChats} />
			</div>
		{/if}
	</div>
</div>

<style>
	.icon-link {
		color: whitesmoke;
	}
</style>
