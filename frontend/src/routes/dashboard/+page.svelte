<script lang="ts">
	import { goto } from '$app/navigation';
	import { selectedDirect, socket, useAuth, profile, onlineUsers } from '$lib/stores';
	import { authService, getProfile, getUserAvatar, getAvatarFromId } from '$lib/api';
	import Button from '$lib/components/Button.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import History from '$lib/components/History.svelte';
	import UsersList from '$lib/components/UsersList.svelte';
	import type { PlayerStatusDto } from '$lib/dtos';

	type Match = {
		//oponentID: string;
		openentNick: string;
		oponentAvatar: string | null;
		mineScore: number;
		oponentScore: number;
	};
	const matchs: Match[] = [
		{
			openentNick: 'Teste',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 5
		},
		{
			openentNick: 'Teste2',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 2
		},
		{
			openentNick: 'Teste3',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 2
		},
		{
			openentNick: 'Teste',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 5
		},
		{
			openentNick: 'Teste2',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 6,
			mineScore: 5
		},
		{
			openentNick: 'Teste3',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 4
		},
		{
			openentNick: 'Teste',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 5
		},
		{
			openentNick: 'Teste2',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 5
		},
		{
			openentNick: 'Teste3',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 4
		},
		{
			openentNick: 'Teste',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 1
		}
	];

	const auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		$socket.disconnect();
		goto('/login');
	}

	$socket.connect();

	async function onLogout() {
		$socket.disconnect();
		await authService.logoutUser();
		goto('/login');
	}

	async function onChat(user: PlayerStatusDto | null) {
		$selectedDirect = user;
		goto('/chat/direct');
	}

	let loadProfile = getProfile();
	let showing: 'chat' | 'history' | 'settings' = 'history';

	loadProfile.then((v) => {
		if (!v) {
			$socket.disconnect();
			goto('/login');
		} else {
			$profile = v.data;
		}
	});

	$: avatar = getUserAvatar(loadProfile);
	$: console.log($selectedDirect);
</script>

<div class="h-full min-h-screen w-full min-w-screen flex flex-col lg:h-screen lg:w-screen">
	<div class="flex-none">
		<PongHeader />
	</div>
	<div class="flex-1 first-letter:w-full flex h-0 lg:flex-row flex-col gap-10 p-10 min-w-3xl">
		<div class="flex lg:w-1/3 w-full h-full lg:order-first order-last">
			{#if showing == 'history'}
				<History {matchs} {avatar} />
			{:else if showing == 'settings'}
				<Settings />
			{/if}
		</div>
		<div class="flex flex-col md:w-1/3 w-full h-full md:order-2 order-first gap-10">
			<Profile bind:profile={loadProfile} {onLogout} {avatar} />

			<div class="flex flex-row items-center h-full">
				<Button type="chat" on:click={() => onChat(null)} />

				<Button
					type="history"
					on:click={() => {
						showing = 'history';
					}}
				/>
				<Button type="settings" on:click={() => (showing = 'settings')} />
				<Button type="play" />
			</div>
		</div>
		<div class="gap-15 flex flex-col justify-start md:w-1/3 w-full h-full md:order-2 order-last">
			<UsersList
				users={$onlineUsers}
				getAvatar={getAvatarFromId}
				on:chat={(e) => onChat(e.detail)}
			/>
		</div>
	</div>
</div>
