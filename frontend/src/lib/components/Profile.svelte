<script lang="ts">
	import type { AxiosResponse } from 'axios';
	import type { ProfileDTO } from '$lib/dtos';
	import AvatarImage from './AvatarImage.svelte';
	import Button from '$lib/components/Button.svelte';
	import LevelIndicator from '$lib/components/LevelIndicator.svelte';
	import { profileService } from '$lib/api'; // Amigos
	import type { MatchHistoryDto } from '$lib/dtos'; // Partidas
	export let onLogout: (() => Promise<void>) | null;
	export let profile: Promise<AxiosResponse<ProfileDTO> | null>;
	export let avatar: Promise<AxiosResponse<Blob> | null>;

</script>

<style>
	.achievement-border {
		border-color: white;
		border-width: 6px;
	}
</style>

<div class="flex flex-col w-full h-full gap-10">
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
			<p>ACHIEVEMENTS:</p>
		</div>
		<div class="flex flex-row w-full justify-around min-w-fit">
			<div class="flex flex-col achievement achievement-border">
				<i class="fa fa-user-plus achievement-icon mb-2" aria-hidden="true"></i>
				<p class="achievement-text">ADD +5</p>
				<p class="achievement-text">FRIENDS</p>
			</div>
			<div class="flex flex-col achievement achievement-border">
				<i class="fa fa-trophy achievement-icon mb-2" aria-hidden="true"></i>
				<p class="achievement-text">WIN +10<p>
				<p class="achievement-text">ROUNDS</p>
			</div>
			<div class="flex flex-col achievement achievement-border">
				<i class="fa fa-gamepad achievement-icon mb-2" aria-hidden="true"></i>
				<p class="achievement-text">PLAY +10</p> 
				<p class="achievement-text">MATCHES</p>
			</div>
		</div>
	{/await}
</div>
