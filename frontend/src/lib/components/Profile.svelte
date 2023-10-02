<script lang="ts">
	import type { AxiosResponse } from 'axios';
	import type { ProfileDTO } from '$lib/dtos';
	import AvatarImage from './AvatarImage.svelte';
	import Button from '$lib/components/Button.svelte';

	export let onLogout: () => Promise<void>;
	export let profile: Promise<AxiosResponse<ProfileDTO> | null>;
	export let avatar: Promise<AxiosResponse<Blob> | null>;
		
</script>

<div class="w-full min-w-fit justify-start mt-10">
	
	<div class="flex min-w-fit">
		
		{#await profile then profile}
			<AvatarImage {avatar} />
			<div class="flex flex-col ml-4 min-w-fit">
				<p class="text-3xl">{profile?.data.nickname}</p>
				<p class="text-2xl text-green-700 flex flex-col">Win: 3</p>
				<p class="text-2xl text-red-700 flex flex-col">Lose: 3</p>
			</div>
		{/await}
		<div class="relative ml-52">
			<Button type="logout" on:click={onLogout} />
		</div>
	</div>
	<div class="w-full min-w-fit flex border-4 border-white justify-center items-center mt-4 mb-8">
		<p class="">LEVEL 2 - 23%</p>
	</div>
	<div class="flex flex-row w-full min-w-fit">
		<p class="mb-5">ACHIEVEMENTS</p>
	</div>
	<div class="flex flex-row h-20 w-full min-w-fit mb-3">
		<div
			class="w-full flex border-4 border-dashed ml-3 mb-3 border-white justify-center items-center"
		>
			<p class="">8 Wins</p>
		</div>
		<div
			class="w-full flex border-4 border-dashed ml-3 mb-3 border-white justify-center items-center"
		>
			<p class="">4 Lose</p>
		</div>
		<div
			class="w-full flex border-4 border-dashed ml-3 mb-3 border-white justify-center items-center"
		>
			<p class="">12 Matchs</p>
		</div>
	</div>
</div>
