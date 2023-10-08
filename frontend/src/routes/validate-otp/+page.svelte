<script lang="ts">
	import { goto } from '$app/navigation';
	import { authService } from '$lib/api';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { isAxiosError } from 'axios';

	async function onSubmit() {
		try {
			await authService.validateOTP(code);
			goto('/');
		} catch (error) {
			if (isAxiosError(error)) {
				if (error.response?.status == 401) {
					alert = 'Invalid code';
				}
			}
		}
	}

	let code = '';
	let alert = '';
	$: code, (alert = '');
</script>
<div class="w-screen h-full min-h-screen">

<PongHeader />
<div class="md:w-2/3 mx-auto w-3/4 pt-20">
	<div class="flex flex-col items-center gap-10">
		<p class="text-3xl text-center">Validate One Time Password</p>
		<input
			placeholder="Enter the Code"
			class={`input-primary ${alert != '' ? 'border-red-500' : ''} `}
			bind:value={code}
		/>
		<p class="text-red-500">
			{alert}
		</p>
		<button class="btn-primary md:w-1/4 w-3/4 min-w-fit " on:click={onSubmit}> Validate </button>
	</div>
</div>
</div>