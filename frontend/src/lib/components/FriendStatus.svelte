<script lang="ts">
	import { goto } from '$app/navigation';

	type User = {
		//oponentID: string;
		nickname: string;
		id: string;
		avatar: string | null;
		status: 'Online' | 'Offline' | 'Playing';
		friend: boolean;
		blocked: boolean;
	};
	const users: User[] = [
		{
			nickname: 'Fulano',
			id: '1',
			avatar: '../../hackathon.png',
			status: 'Online',
			friend: false,
			blocked: false
		},
		{
			nickname: 'Sicrano',
			id: '12',
			avatar: '../../palavra-chave.png',
			status: 'Offline',
			friend: true,
			blocked: false
		},
		{
			nickname: 'Beltrano',
			id: '13',
			avatar: '../../rapido.png',
			status: 'Playing',
			friend: false,
			blocked: true
		},
		{
			nickname: 'Colega',
			id: '14',
			avatar: '../../camera.png',
			status: 'Playing',
			friend: false,
			blocked: false
		},
		{
			nickname: 'Colega',
			id: '14',
			avatar: '../../camera.png',
			status: 'Playing',
			friend: false,
			blocked: false
		}
	];
	async function onChat() {
		goto('/chat');
	}
</script>

{#each users as user}
	<div
		class="w-full border-b border-opacity-20 border-white flex flex-row p-2 gap-4 justify-between items-center"
	>
		<div class="flex flex-row gap-4 items-center">
			<img
				class="avatar max-w-sm aspect-square w-10 h-10"
				src={user.avatar}
				alt={user.nickname}
				title={user.nickname}
			/>
			<div class="flex flex-col justify-start">
				<p class="flex flex-col">{user.nickname}</p>
				{#if user.blocked}
					<div class="text-red-800 text-xs">Blocked</div>
				{:else}
					<p class=" text-green-600 text-xs">{user.status}</p>
					{#if user.friend}
						<div class="text-gray-600 text-xs">Friend</div>
					{/if}
				{/if}
			</div>
		</div>
		<div class="flex flex-row items-center gap-1 text-center text-xs justify-end flex-wrap">
			{#if !user.blocked}
				{#if !user.friend}
					<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
						<img src="/adicionar-usuario.png" alt="add friend" width="90%" />
						<p class="text-center">FRIEND</p>
					</button>
				{/if}
				<button
					class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1"
					on:click={onChat}
				>
					<img src="/bate-papo-de-texto.png" alt="let's chat" />
					<p class="text-center">CHAT</p>
				</button>
				<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
					<img src="/bloqueado.png" alt="block this user" width="90%" />
					<p class="text-center">BLOCK</p>
				</button>
				<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
					<img src="/pingue-pongue.png" alt="let's play" />
					<p class="text-center">PLAY</p>
				</button>
			{:else}
				<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
					<img src="/bloqueado.png" alt="block this user" width="90%" />
					<p class="text-center">UNBLOCK</p>
				</button>
			{/if}
		</div>
	</div>
{/each}
