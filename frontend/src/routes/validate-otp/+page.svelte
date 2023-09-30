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

<PongHeader />
<div class="w-2/3 mx-auto">
	<div class="gap-5 flex flex-col pt-10 items-center">
		<p class="text-3xl mt-20 mb-10">Validate One Time Password</p>
		<input
			placeholder="Enter the Code"
			class={`input-primary ${alert != '' ? 'border-red-500' : ''} `}
			bind:value={code}
		/>
		<p class="text-red-500">
			{alert}
		</p>
		<button class="btn-primary w-1/4" on:click={onSubmit}> Validate </button>
	</div>
</div>
