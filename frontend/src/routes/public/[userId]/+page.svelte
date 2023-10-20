<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/stores';
	import { getPublicProfile, getUserAvatar } from '$lib/api';
	import Profile from '$lib/components/Profile.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { page } from '$app/stores';

	const auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	}
	const userId = $page.params['userId']!;

	$: profile = getPublicProfile(userId);

	$: avatar = getUserAvatar(profile);
</script>

<div class="h-full min-h-screen w-full min-w-screen flex flex-col lg:h-screen lg:w-screen">
	<div class="flex-none">
		<PongHeader />
	</div>
	<div class="flex flex-col justify-end items-end">
		<a href="/dashboard">
			<i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" />
		</a>
	</div>
	<div class="flex flex-col lg:w-1/2 w-full h-full mx-auto">
		{#await profile}
			Loading
		{:then}
			<Profile {profile} onLogout={null} {avatar} />
		{/await}
	</div>
</div>
