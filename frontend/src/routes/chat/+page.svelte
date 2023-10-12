<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import DirectMessages from '$lib/components/DirectMessages.svelte';
	import GroupMessages from '$lib/components/GroupMessages.svelte';
	import { useAuth } from '$lib/stores';
	import { goto } from '$app/navigation';

	const auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	}

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
		visibility: 'public' | 'private';
	};

	type GroupPreview = GroupBase;

	type Group = GroupBase & {
		members: GroupMember[];
		messages: Message[];
	};

	let directPreview: DirectPreview[] = [
		{
			id: '1',
			avatarId: '../../camera.png',
			name: 'Usuário 1',
			status: 'Online',
			blocked: true
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

	let directData: Direct[] = [
		{
			id: '1',
			avatarId: '../../camera.png',
			name: 'Usuário 1',
			status: 'Online',
			blocked: true,
			messages: [
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
			]
		},
		{
			id: '2',
			avatarId: '../../rapido.png',
			name: 'Usuário 2',
			status: 'Offline',
			messages: [
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
			]
		},
		{
			id: '3',
			avatarId: '../../rapido.png',
			name: 'Usuário 3',
			status: 'Playing',
			messages: [
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
			]
		},
		{
			id: '4',
			avatarId: '../../rapido.png',
			name: 'Usuário 4',
			status: 'Online',
			messages: [
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
			]
		},
		{
			id: '5',
			avatarId: '../../rapido.png',
			name: 'Usuário 5',
			status: 'Offline',
			messages: [
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
		}
	];

	let groupsPreview: GroupPreview[] = [
		{
			id: '401',
			name: 'Grupo de Trabalho',
			visibility: 'public'
		},
		{
			id: '402',
			name: 'Grupo de Estudo',
			visibility: 'private'
		},
		{
			id: '403',
			name: 'Grupo de Amigos',
			visibility: 'private'
		}
	];

	let groupsData: Group[] = [
		{
			id: '401',
			name: 'Grupo de Trabalho',
			visibility: 'public',
			members: [
				{
					id: '201',
					avatarId: '../../camera.png',
					name: 'Alice',
					status: 'Online',
					role: 'owner'
				},
				{
					id: '0',
					avatarId: '../../rapido.png',
					name: 'Teste',
					status: 'Offline',
					role: 'admin'
				},
				{
					id: '202',
					avatarId: '../../rapido.png',
					name: 'Bob',
					status: 'Offline',
					role: 'member'
				}
			],
			messages: [
				{
					name: 'Alice',
					authorId: '201',
					date: '0',
					message: 'Bem-vindo ao Grupo de Trabalho!'
				},
				{
					name: 'Bob',
					authorId: '202',
					date: '0',
					message: 'O que vamos discutir hoje na reunião?'
				},
				{
					name: 'Teste',
					authorId: '0',
					date: '0',
					message: 'O que vamos discutir hoje na reunião?'
				}
			]
		},
		{
			id: '402',
			name: 'Grupo de Estudo',
			visibility: 'private',
			members: [
				{
					id: '203',
					avatarId: '../../camera.png',
					name: 'Carol',
					status: 'Online',
					role: 'owner'
				},
				{
					id: '204',
					avatarId: '../../rapido.png',
					name: 'David',
					status: 'Offline',
					role: 'member'
				},
				{
					id: '0',
					avatarId: '../../rapido.png',
					name: 'Teste',
					status: 'Offline',
					role: 'admin'
				}
			],
			messages: [
				{
					name: 'Carol',
					authorId: '203',
					date: '0',
					message: 'Vamos começar a estudar para o exame.'
				},
				{
					name: 'Teste',
					authorId: '0',
					date: '0',
					message: 'O que vamos discutir hoje na reunião?'
				},
				{
					name: 'David',
					authorId: '204',
					date: '0',
					message: 'Alguém tem um bom material de estudo?'
				}
			]
		},
		{
			id: '403',
			name: 'Grupo de Amigos',
			visibility: 'private',
			members: [
				{
					id: '205',
					avatarId: '../../camera.png',
					name: 'Eva',
					status: 'Online',
					role: 'owner'
				},
				{
					id: '0',
					avatarId: '../../rapido.png',
					name: 'Teste',
					status: 'Offline',
					role: 'admin'
				},
				{
					id: '206',
					avatarId: '../../rapido.png',
					name: 'Frank',
					status: 'Offline',
					role: 'member'
				}
			],
			messages: [
				{
					name: 'Eva',
					authorId: '205',
					date: '0',
					message: 'Que tal marcarmos um encontro este fim de semana?'
				},
				{
					name: 'Frank',
					authorId: '206',
					date: '0',
					message: 'Boa ideia! Vamos ao cinema.'
				},
				{
					name: 'Teste',
					authorId: '0',
					date: '0',
					message: 'O que vamos discutir hoje na reunião?'
				}
			]
		}
	];

	function showDirect(index: number) {
		// TODO: trocar index pelo id do user e requisitar o dado do backend
		selectedDirect = directData[index];
	}

	function showGroup(index: number) {
		// TODO: trocar index pelo id do user e requisitar o dado do backend
		selectedGroup = groupsData[index];
	}

	let selectedDirect: Direct | null = null;
	let selectedGroup: Group | null = null;

	let panel: 'direct' | 'groups' | 'create-group' = 'direct';

	// $: showingMessages == 'direct' ? (messages = directMessages[0]) : (messages = groupData[0]);
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
				<div class="flex-none flex flex-row gap-4 px-4 py-2">
					<!-- TODO: padronizar botões e estilo baseado na variável "showingMessages" -->
					<button
						class="border-2 border-white h-10 flex-1 items-center justify-center"
						on:click={() => {
							panel = 'direct';
						}}
					>
						<p class="text-center">Direct Messages</p>
					</button>
					<button
						class="border-2 border-white h-10 flex-1 items-center justify-center"
						on:click={() => {
							panel = 'groups';
						}}
					>
						<p class="">Groups</p>
					</button>
				</div>
				{#if panel == 'direct'}
					{#each directPreview as user, i}
						<button
							on:click={() => showDirect(i)}
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
								{#if user.blocked}
									<p class="flex flex-col text-red-600">Blocked</p>
								{:else}
									<p class="flex flex-col text-green-600">{user.status}</p>
								{/if}
							</div>
						</button>
					{/each}
				{:else}
					<div class="h-full w-full flex flex-col">
						{#each groupsPreview as group, i}
							<button
								on:click={() => showGroup(i)}
								class="p-2 border-b border-gray-800 border-x-white flex flex-row bg-yellow-500 bg-opacity-0 hover:bg-opacity-10"
							>
								<div class="flex flex-col ml-3 w-full items-start">
									<div class="flex flex-row justify-between w-full">
										<p class="flex flex-col">{group.name}</p>
										<p class=" text-gray-600 font-extralight">
											{group.visibility}
										</p>
									</div>
								</div>
							</button>
						{/each}
					</div>
					{#if panel == 'groups'}
						<div class="p-2">
							<button class="btn-primary" on:click={() => (panel = 'create-group')}>
								Create Group
							</button>
						</div>
					{/if}
				{/if}
			</div>
		</div>
		<div class="flex flex-col w-full h-full">
			{#if panel == 'direct'}
				<DirectMessages bind:direct={selectedDirect} />
			{:else if panel == 'groups'}
				<GroupMessages bind:group={selectedGroup} />
			{:else}
				create group
			{/if}
		</div>
	</div>
</div>

<style>
	.icon-link {
		color: whitesmoke;
	}
</style>
