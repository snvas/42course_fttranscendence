<script lang="ts">
	import type { AxiosResponse } from 'axios';
	import Image from './Image.svelte';

	export let avatar: Promise<AxiosResponse<Blob> | null> | null;
</script>

{#await avatar}
	<Image />
{:then avatar}
	{#if avatar}
		<img class="w-full h-full aspect-square" src={URL.createObjectURL(avatar?.data)} alt="" />
	{:else}
		<Image />
	{/if}
{/await}
