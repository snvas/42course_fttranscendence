<script lang="ts">
	import { AxiosError, type AxiosResponse } from 'axios';
	import type { ProfileDTO } from '$lib/dtos';
	import { authService, profileService } from '$lib/api';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { auth } from '$lib/stores';
	import Image from '$lib/components/Image.svelte';

	$: if (!$auth.loading && !$auth.loggedIn) {
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

	async function onDelete() {
		await profileService.deleteAccount();
		goto('/login');
	}

	let profile = getProfile();

	$: avatar = getUserAvatar(profile);
</script>

<PongHeader />
<button class="btn-primary" on:click={onLogout}>logout</button>
<button class="btn-primary" on:click={onDelete}>delete account</button>
{#await profile then profile}
	<p>Nickname: {profile?.data.nickname}</p>
	{#await avatar}
		<Image />
	{:then avatar}
		{#if avatar}
			<img class="avatar" src={URL.createObjectURL(avatar?.data)} alt="d" />
		{:else}
			<Image />
		{/if}
	{/await}
{/await}

<Button type="stats" />
<Button type="history" />
<Button type="settings" />
<Button type="play" />
