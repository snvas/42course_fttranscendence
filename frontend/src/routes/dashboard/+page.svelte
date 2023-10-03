<script lang="ts">
	import { AxiosError, type AxiosResponse } from 'axios';
	import type { ProfileDTO } from '$lib/dtos';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores';
	import { authService, profileService } from '$lib/api';
	import Button from '$lib/components/Button.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import History from '$lib/components/History.svelte';
	import Chat from '$lib/components/Chat.svelte';

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	}

	async function getProfile(): Promise<AxiosResponse<ProfileDTO> | null> {
		try {
			let p = await profileService.getProfile();
			return p;
		} catch (error) {
			if (error instanceof AxiosError) {
				if (error.response?.status == 404) {
					goto('/welcome');
				} else {
					goto('/login');
				}
			}
			return null;
		}
	}

	async function getUserAvatar(profilePromise: Promise<AxiosResponse<ProfileDTO> | null>) {
		try {
			let profile = await profilePromise;
			if (!profile?.data.avatarId) throw new Error();
			let image = await profileService.getAvatarImage(profile.data.avatarId);
			return image;
		} catch {
			return null;
		}
	}

	async function onLogout() {
		await authService.logoutUser();
		goto('/login');
	}

	let profile = getProfile();
	let showing: 'stats' | 'history' | 'settings' = 'history';

	$: avatar = getUserAvatar(profile);
	$: console.log($auth);
	$: console.log(showing);
</script>

<div class="h-screen w-screen flex flex-col">
	<div class="flex-none">
		<PongHeader />
	</div>
	<div class="flex-1 first-letter:w-full flex h-0 flex-row p-10 gap-10">
		<div class="flex w-1/3 h-full">
			{#if showing == 'history'}
				<History {avatar} />
			{:else if showing == 'settings'}
				<Settings />
			{/if}
		</div>
		<div class="flex flex-col w-1/3 mx-4 h-full">
			<Profile bind:profile {onLogout} {avatar} />
			<div class=" flex flex-row items-center mt-10 w-3/4 justify-center ml-10">
				<Button
					type="stats"
					on:click={() => {
						showing = 'stats';
					}}
				/>
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
		<div class="gap-15 flex flex-col justify-start w-1/3 h-full">
			<Chat />
		</div>
	</div>
</div>
