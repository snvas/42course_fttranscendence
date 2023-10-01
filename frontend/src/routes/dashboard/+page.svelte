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

<PongHeader />
<div class="w-full mx-auto flex flex-row mt-10">
	<div class="flex flex-col justify-center w-1/3 ml-8 mr-8 xs:w-full">
		{#if showing == 'history'}
			<History {avatar} />
		{:else if showing == 'settings'}
			<Settings />
		{/if}
	</div>
	<div class="gap-15 flex flex-col justify-center w-1/3 ml-4 mr-4 h-screen">
		<Profile bind:profile {onLogout} {avatar} />
		<div class=" flex flex-row items-center">
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
	<div class="gap-15 flex flex-col justify-center pt-10 w-1/3 ml-8 mr-8 h-screen">
		<p>Chat</p>
	</div>
</div>
