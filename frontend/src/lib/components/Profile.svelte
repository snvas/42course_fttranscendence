<script lang="ts">
	import type { AxiosResponse } from 'axios';
	import type { ProfileDTO } from '$lib/dtos';
	import AvatarImage from './AvatarImage.svelte';
	import Button from '$lib/components/Button.svelte';
	import LevelIndicator from '$lib/components/LevelIndicator.svelte';
	export let onLogout: (() => Promise<void>) | null;
	export let profile: Promise<AxiosResponse<ProfileDTO> | null>;
	export let avatar: Promise<AxiosResponse<Blob> | null>;
	let percentage = 23;
</script>

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
		<LevelIndicator levelPercentage={percentage} />

		<div class="flex flex-row w-full min-w-fit">
			<p class="mb-5">ACHIEVEMENTS</p>
		</div>
		<div class="flex flex-row h-20 w-full min-w-fit gap-5">
			<div
				class="w-full flex border-4 border-dashed border-white justify-center items-center rounded-xl"
			>
				<p class="">{profile?.data.wins} Wins</p>
			</div>
			<div
				class="w-full flex border-4 border-dashed border-white justify-center items-center rounded-xl"
			>
				<p class="">{profile?.data.losses} Lose</p>
			</div>
			<div
				class="w-full flex border-4 border-dashed border-white justify-center items-center rounded-xl"
			>
				<p class="">{profile?.data.draws} Draws</p>
			</div>
			<div
				class="w-full flex border-4 border-dashed border-white justify-center items-center rounded-xl"
			>
				<p class="">
					{(profile?.data.draws ?? 0) + (profile?.data.wins ?? 0) + (profile?.data.losses ?? 0)} Matches
				</p>
			</div>
		</div>
	{/await}
</div>
