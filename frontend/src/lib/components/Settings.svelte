<script lang="ts">
	import { useAuth } from '$lib/stores';
	import { authService } from '$lib/api';
	import { goto } from '$app/navigation';
	import { verifyUnautorized } from '$lib/utils';

	let auth = useAuth();

	async function onEditProfile() {
		goto('/edit-profile');
	}

	async function onGameCustomize() {
		goto('/customize');
	}

	async function onGameRules() {
		goto('/controls&rules');
	}

	async function onTwoFactorAuth() {
		if (!tfaEnabled) {
			goto('/enable2fa');
		} else {
			try {
				await authService.disable2FA();
				message = 'Two Factor Authentication disabled!';
				auth = useAuth();
			} catch (error) {
				verifyUnautorized(error);
			}
		}
	}

	let message = '';
	$: tfaEnabled = $auth.session?.otpEnabled;
</script>

<div class="flex flex-col gap-4 justify-center w-full items-center">
	<div class="h-12 text-green-500 text-2xl text-center pb-10">
		{message}
	</div>
	<button class="btn-primary-yellow" on:click={onGameRules}>Controls & Rules</button>
	<button class="btn-primary" on:click={onGameCustomize}>Customize your game</button>
	<button class="btn-primary" on:click={onEditProfile}>Edit your profile</button>
	<button class="btn-primary" on:click={onTwoFactorAuth}>
		{!tfaEnabled ? 'Enable' : 'Disable'} Two Factor Authentication
	</button>
</div>
