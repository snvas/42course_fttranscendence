<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/stores';
	import { authService, getProfile, getUserAvatar, profileService } from '$lib/api';
	import Button from '$lib/components/Button.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import History from '$lib/components/History.svelte';
	import Chat from '$lib/components/Chat.svelte';
	import DirectMessages from '$lib/components/DirectMessages.svelte';


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

<div class="h-full min-h-screen w-screen flex flex-col md:h-screen">
	<div class="flex-none">
		<PongHeader />
	</div>
	<div class="flex-1 first-letter:w-full flex h-0 md:flex-row flex-col gap-10 p-10">
		<div class="flex md:w-1/3 w-full h-full md:order-first order-last">
			{#if showing == 'history'}
				<History {avatar} />
			{:else if showing == 'settings'}
				<Settings />
			{/if}
		</div>
		<div class="flex flex-col md:w-1/3 w-full h-full md:order-2 order-first gap-10">
			<Profile bind:profile {onLogout} {avatar} />
			<div class="flex flex-row items-center h-full">
				<Button
					type="chat"
					on:click={onChat}
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
		<div class="gap-15 flex flex-col justify-start md:w-1/3 w-full h-full md:order-2 order-last">
			<Chat />
		</div>
	</div>
	
</div>


