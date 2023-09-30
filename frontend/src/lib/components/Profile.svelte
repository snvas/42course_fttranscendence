<script lang="ts">
	import { AxiosError, type AxiosResponse } from 'axios';
	import type { ProfileDTO } from '$lib/dtos';
	import { profileService } from '$lib/api';
	import { goto } from '$app/navigation';
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
	let profile = getProfile();
	$: avatar = getUserAvatar(profile);
</script>

<div class="w-full min-w-fit">
	<div class="flex min-w-fit">
		{#await profile then profile}
			{#await avatar}
				<Image />
			{:then avatar}
				{#if avatar}
					<img class="avatar flex flex-row" src={URL.createObjectURL(avatar?.data)} alt="d" />
				{:else}
					<Image />
				{/if}
			{/await}
			<div class="flex flex-col ml-4 min-w-fit">
				<p class="text-3xl">{profile?.data.nickname}</p>
				<p class="text-2xl text-green-700 flex flex-col">Win: 3</p>
				<p class="text-2xl text-red-700 flex flex-col">Lose: 3</p>
			</div>
		{/await}
	</div>
	<div class="w-full min-w-fit flex border-4 border-white justify-center items-center mt-4 mb-8">
		<p class="">LEVEL 2 - 23%</p>
	</div>
	<div class="flex flex-row w-full min-w-fit">
		<p class="">ACHIEVEMENTS</p>
	</div>
	<div class="flex flex-row h-20 w-full min-w-fit mb-3">
		<div class="w-full flex border-4 border-dashed ml-3 mb-3 border-white justify-center items-center">
			<p class="">8 Wins</p>
		</div>
		<div class="w-full flex border-4 border-dashed ml-3 mb-3 border-white justify-center items-center">
			<p class="">4 Lose</p>
		</div>
		<div class="w-full flex border-4 border-dashed ml-3 mb-3 border-white justify-center items-center">
			<p class="">12 Matchs</p>
		</div>
	</div>
	
</div>
