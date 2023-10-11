<script lang="ts">
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
		}
	];
</script>

{#each users as user, i}
	<div
		class="w-full border-b border-opacity-20 border-white flex flex-row p-2 gap-4 justify-between"
	>
		<div class="flex flex-row gap-4">
			<img
				class="avatar max-w-sm aspect-square w-10 h-10"
				src={user.avatar}
				alt={user.nickname}
				title={user.nickname}
			/>
			<div class="flex flex-col">
				<p class="flex flex-col">{user.nickname}</p>
				<div class="flex gap-2">
					<p class=" text-green-600">{user.status}</p>
					{#if user.friend}
						<div class="text-gray-600">|</div>
						<div class="text-gray-600">Friend</div>
					{/if}
					{#if user.blocked}
						<div class="text-gray-600">|</div>
						<div class="text-red-800">Blocked</div>
					{/if}
				</div>
			</div>
		</div>
		<div>
			<button> FRIEND </button>
			<button> CHAT </button>
			<button> BLOCK </button>
			<button> PLAY </button>
		</div>
	</div>
{/each}
