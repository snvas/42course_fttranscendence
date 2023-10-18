<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/stores';
	import { authService, getProfile, getUserAvatar, getAvatarFromId } from '$lib/api';
	import Button from '$lib/components/Button.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import History from '$lib/components/History.svelte';
	import UsersList from '$lib/components/UsersList.svelte';
	import type { PlayerStatusDto } from '$lib/dtos';

	type User = PlayerStatusDto & {
		friend: boolean;
		blocked: boolean;
	};

	const users: User[] = [
		{
			nickname: 'Teste',
			id: 1,
			status: 'Offline',
			friend: true,
			blocked: false
		},
		{
			nickname: 'Sicrano',
			id: 12,
			status: 'Offline',
			friend: true,
			blocked: false
		},
		{
			nickname: 'Beltrano',
			id: 13,
			status: 'Playing',
			friend: false,
			blocked: true
		},
		{
			nickname: 'Colega',
			id: 14,
			status: 'Playing',
			friend: false,
			blocked: false
		},
		{
			nickname: 'Colega',
			id: 14,
			status: 'Playing',
			friend: false,
			blocked: false
		}
	];

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
		},{
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
		goto('/login');
	}

	async function onLogout() {
		await authService.logoutUser();
		goto('/login');
	}

	async function onChat() {
		goto('/chat');
	}

	$: profile = getProfile();
	let showing: 'chat' | 'history' | 'settings' = 'history';

	$: avatar = getUserAvatar(profile);
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
		<div class="flex flex-col lg:w-1/3 w-full h-full lg:order-2 order-first gap-10">
			<Profile bind:profile {onLogout} {avatar} />
			<div class="flex flex-row items-center h-full">
				<Button type="chat" on:click={onChat} />

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
		<div class="gap-15 flex flex-col justify-start lg:w-1/3 w-full h-full lg:order-3 order-2">
			<UsersList {users} getAvatar={getAvatarFromId} />
		</div>
	</div>
</div>
