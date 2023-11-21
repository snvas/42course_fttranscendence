<script lang="ts">
	import type { AxiosResponse } from 'axios';
	import type { ProfileDTO } from '$lib/dtos';
	import AvatarImage from './AvatarImage.svelte';
	import Button from '$lib/components/Button.svelte';
	import LevelIndicator from '$lib/components/LevelIndicator.svelte';
	export let onLogout: (() => Promise<void>) | null;
	export let profile: Promise<AxiosResponse<ProfileDTO> | null>;
	export let avatar: Promise<AxiosResponse<Blob> | null>;
	import AchievementsModal from '$lib/components/achievementsModal.svelte';
	import { writable } from 'svelte/store';
	import { friendsList } from '$lib/stores';

	// Create a writable store
	export const showAchievements = writable('hide');

	function onShowAllAchievements() {
		showAchievements.set('show');
	}

</script>

<div class="flex flex-col w-full h-full gap-10">
	{#if $showAchievements == 'show'}
		<AchievementsModal show={showAchievements}/>
	{/if}
	{#await profile}
		Loading
	{:then profile}
		<div class="flex w-full gap-4">
			<div class="flex-initial flex-shrink-0 lg:w-28 w-16">
				<AvatarImage {avatar} />
			</div>
			<div class="flex-1 flex flex-col">
				<p class="lg:text-3xl md:text-2xl sm:text-xl text-lg">{profile?.data.nickname}</p>
				<p class="lg:text-2xl text-md text-green-700 flex flex-col">
					Win: {profile?.data.wins}
				</p>
				<p class="lg:text-2xl text-md text-red-700 flex flex-col">
					Lose: {profile?.data.losses}
				</p>
			</div>
			{#if onLogout}
				<div class="flex-none">
					<Button type="logout" on:click={onLogout} />
				</div>
			{/if}
		</div>
		<LevelIndicator level={profile?.data.level} levelPercentage={profile?.data.level_percentage} />

		<div class="flex flex-row w-full min-w-fit">
			<p class="text-xl ml-2">ACHIEVEMENTS:</p>
		</div>
		<div class="flex flex-row w-full justify-around min-w-fit">
			{#if $friendsList.length > 30}
				<button class="flex flex-col achievement achievement-gold" on:click={onShowAllAchievements}>
					<i class="fa fa-user-plus achievement-icon mb-2" aria-hidden="true"></i>
					<p >ADD +30</p>
					<p >FRIENDS</p>
				</button>
			{:else if $friendsList.length > 15}
				<button class="flex flex-col achievement achievement-silver" on:click={onShowAllAchievements}>
					<i class="fa fa-user-plus achievement-icon mb-2" aria-hidden="true"></i>
					<p >ADD +15</p>
					<p >FRIENDS</p>
				</button>
			{:else if $friendsList.length > 5}
				<button class="flex flex-col achievement achievement-bronze" on:click={onShowAllAchievements}>
					<i class="fa fa-user-plus achievement-icon mb-2" aria-hidden="true"></i>
					<p >ADD +5</p>
					<p >FRIENDS</p>
				</button>
			{:else}
				<button class="flex flex-col achievement achievement-none" on:click={onShowAllAchievements}>
					<i class="fa fa-user-plus achievement-icon mb-2" aria-hidden="true"></i>
					<p >ADD +5</p>
					<p >FRIENDS</p>
				</button>
			{/if}
			{#if (profile?.data.wins ?? 0) > 100}
				<button class="flex flex-col achievement achievement-gold" on:click={onShowAllAchievements}>
					<i class="fa fa-trophy achievement-icon mb-2" aria-hidden="true"></i>
					<p >WIN +100<p>
					<p >ROUNDS</p>
				</button>
			{:else if (profile?.data.wins ?? 0) > 30}
				<button class="flex flex-col achievement achievement-silver" on:click={onShowAllAchievements}>
					<i class="fa fa-trophy achievement-icon mb-2" aria-hidden="true"></i>
					<p >WIN +30<p>
					<p >ROUNDS</p>
				</button>
			{:else if (profile?.data.wins ?? 0) > 10}
				<button class="flex flex-col achievement achievement-bronze" on:click={onShowAllAchievements}>
					<i class="fa fa-trophy achievement-icon mb-2" aria-hidden="true"></i>
					<p >WIN +10<p>
					<p >ROUNDS</p>
				</button>
			{:else}
				<button class="flex flex-col achievement achievement-none" on:click={onShowAllAchievements}>
					<i class="fa fa-trophy achievement-icon mb-2" aria-hidden="true"></i>
					<p >WIN +10<p>
					<p >ROUNDS</p>
				</button>
			{/if}
			{#if (profile?.data.wins ?? 0) + (profile?.data.losses ?? 0) > 100}
				<button class="flex flex-col achievement achievement-gold" on:click={onShowAllAchievements}>
					<i class="fa fa-gamepad achievement-icon mb-2" aria-hidden="true"></i>
					<p >PLAY +100</p>
					<p >MATCHES</p>
				</button>
			{:else if (profile?.data.wins ?? 0) + (profile?.data.losses ?? 0) > 30}
				<button class="flex flex-col achievement achievement-silver" on:click={onShowAllAchievements}>
					<i class="fa fa-gamepad achievement-icon mb-2" aria-hidden="true"></i>
					<p >PLAY +30</p>
					<p >MATCHES</p>
				</button>
			{:else if (profile?.data.wins ?? 0) + (profile?.data.losses ?? 0) > 10}
				<button class="flex flex-col achievement achievement-bronze" on:click={onShowAllAchievements}>
					<i class="fa fa-gamepad achievement-icon mb-2" aria-hidden="true"></i>
					<p >PLAY +10</p>
					<p >MATCHES</p>
				</button>
			{:else}
				<button class="flex flex-col achievement achievement-none" on:click={onShowAllAchievements}>
					<i class="fa fa-gamepad achievement-icon mb-2" aria-hidden="true"></i>
					<p >PLAY +10</p>
					<p >MATCHES</p>
				</button>
			{/if}
		</div>
	{/await}
</div>
