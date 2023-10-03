<script lang="ts">
	import { auth } from '$lib/stores';
	import { authService, profileService } from '$lib/api';
	import { goto } from '$app/navigation';

	async function onDelete() {
		await profileService.deleteAccount();
		goto('/login');
	}

	async function onTwoFactorAuth() {
		if (twofaDisabled) {
			goto('/enable2fa');
		} else {
			await authService.disable2FA();
			tempDisabled = true;
		}
	}

	let tempDisabled = false;

	$: twofaDisabled = !$auth.session?.otpEnabled || tempDisabled;
</script>

<div class="flex flex-col gap-4 justify-center w-full">
	<button class="btn-primary" on:click={onDelete}>Edit your profile</button>
	<button class="btn-primary" on:click={onTwoFactorAuth}>
		{twofaDisabled ? 'Enable' : 'Disable'} Two Factor Authentication
	</button>
	<button class="btn-primary" on:click={onDelete}>delete account</button>
</div>
