<script lang="ts">
	import History from '$lib/components/History.svelte';
	import { AxiosError, type AxiosResponse } from 'axios';
	import type { ProfileDTO } from '$lib/dtos';
	import { authService, profileService } from '$lib/api';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { auth } from '$lib/stores';
	import Image from '$lib/components/Image.svelte';
	import Profile from '$lib/components/Profile.svelte';

	let qrcode;
	function onSubmit() {
		goto('http://localhost:3001/');
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

<PongHeader />
<div class="w-full mx-auto flex flex-row mt-10">
	<div class="flex flex-col justify-center w-1/3 ml-8 mr-8 xs:w-full">
		<History {avatar} />
	</div>
		<div class="gap-15 flex flex-col justify-center w-1/3 ml-4 mr-4 h-screen">
			<Profile />
			<div class=" flex flex-row items-center">
				<Button type="stats" />
				<Button type="history" />
				<Button type="settings" />
				<Button type="play" />
			</div>
		</div>
		<div class="gap-15 flex flex-col justify-center pt-10 w-1/3 ml-8 mr-8 h-screen">
			<p>Chat</p>
		</div>
</div>