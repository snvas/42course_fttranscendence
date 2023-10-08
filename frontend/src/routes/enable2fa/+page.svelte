<script lang="ts">
	import { goto } from '$app/navigation';
	import { authService } from '$lib/api';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { isAxiosError } from 'axios';

	let alert = '';
	let success = false;
	async function getQrcode() {
		try {
			let res = await authService.get2FAQRCode();
			return res.data;
		} catch {
			goto('/login');
		}
	}

	async function onEnable() {
		if (success) {
			goto('/');
		} else {
			alert = '';
			try {
				await authService.enable2FA(code);
				success = true;
			} catch (error) {
				if (isAxiosError(error)) {
					if (error.response?.status == 401) {
						alert = 'Invalid code';
					}
				}
			}
		}
	}

	let qrcode = getQrcode();
	let code: string;

	$: code, (alert = '');
	$: if (success) {
		code = 'Two Factor Autentication Enabled!';
	}
</script>
<div class="h-full min-h-screen w-screen">
<PongHeader />
<div class="flex flex-col justify-end items-end">
	<a href="/dashboard"><i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" /></a>
</div>
<div class="w-2/3 mx-auto">
	<div class="gap-5 flex flex-col items-center">
		<p class="text-xl mt-20 mb-10 text-center">Scan QR Code with an Authentication App!</p>
		{#await qrcode then qrcode}
			<img src={qrcode} alt="qrcode" />
		{/await}
		<input
			placeholder="Enter the Code"
			disabled={success}
			class={`input-primary ${
				alert != '' ? 'border-red-500' : success ? 'border-green-500 text-green-500' : ''
			}`}
			bind:value={code}
		/>
		<p class="text-red-500">
			{alert}
		</p>
		<button class="btn-primary w-1/4 min-w-fit" on:click={onEnable}>
			{success ? 'Go to home' : 'Register'}
		</button>
	</div>
</div>
</div>
<style>
	img {
		-webkit-filter: invert(1);
		filter: invert(1);
	}
	.icon-link{
		color: whitesmoke;
	}
</style>
