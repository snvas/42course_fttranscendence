<script lang="ts">
	import { AxiosError, type AxiosResponse } from 'axios';
	import type { FortyTwoUserDto, ProfileDTO, ResponseMessageDto } from '$lib/dtos';
	import { authService, profileService } from '$lib/api';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';

	// [ ] se validateUserSession causa erro, vai para login

	async function getProfile() {
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
		}
	}

	async function onValidate() {
		try {
			await authService.validateUserSession();
		} catch {
			goto('/login');
		}
	}

	async function onLogout() {
		await authService.logoutUser();
		goto('/login');
	}

	let profile = getProfile();
</script>

<PongHeader />
<button class="btn-primary" on:click={onLogout}>logout</button>
{#await profile}
	Loading
{:then profile}
	{profile?.data.nickname}
{/await}
<Button type="stats" />
<Button type="history" />
<Button type="settings" />
<Button type="play" />
