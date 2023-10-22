<script lang="ts">
	import type { AxiosResponse } from 'axios';
	import Image from './Image.svelte';

	export let avatar: Promise<AxiosResponse<Blob> | null> | null;
</script>

{#await avatar}
	<Image />
{:then avatar}
	{#if avatar}
		<img class="w-full aspect-square rounded-full" src={URL.createObjectURL(avatar?.data)} alt="avatar" />
	{:else}
		<Image />
	{/if}
{/await}
