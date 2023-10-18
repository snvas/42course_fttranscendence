<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/stores';
	import { getProfile, getUserAvatar, profileService, authService } from '$lib/api';

	import PongHeader from '$lib/components/PongHeader.svelte';
	import Image from '$lib/components/Image.svelte';
	import Camera from '$lib/components/Camera.svelte';
	import type { ProfileDTO } from '$lib/dtos';
	import { isAxiosError } from 'axios';

	let auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	}

	const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

	const imageAlerts = {
		none: '',
		size: 'The file you are trying to upload is too large',
		type: 'Invalid file type',
		error: 'Unknown error'
	};

	const imageSuccess = {
		update: 'Your avatar image was updated!',
		already: 'This image already is your avatar!'
	};

	const profileAlerts = {
		none: '',
		unavaliable: 'Nickname unavaliable!',
		error: 'unknown error'
	};

	const profileSuccess = {
		update: 'Profile updated sucessfully!'
	};

	let profile = getProfile();

	let avatar: Blob | null;
	let originAvatar: Blob | null;
	let loading = getUserAvatar(profile).then((value) => {
		avatar = value?.data ?? null;
		originAvatar = avatar;
	});

	let tempProfile: Partial<ProfileDTO> = {};
	profile.then((value) => {
		if (value) {
			// all fields in profile editor must be here
			tempProfile.nickname = value?.data.nickname;
		} else {
			// TODO: adicionar verificação
		}
	});

	let fileInput: HTMLInputElement;
	let alert = imageAlerts.none;
	let profileAlert = profileAlerts.none;

	const onFileSelected = () => {
		resetAlerts();
		let file = fileInput.files![0];

		if (!allowedTypes.includes(file.type)) {
			alert = imageAlerts.type;
		} else if (file.size > 1024 * 1024) {
			alert = imageAlerts.size;
		} else {
			avatar = file;
			alert = imageAlerts.none;
		}
	};

	async function onUpdateImage() {
		resetAlerts();
		if (avatar && avatar != originAvatar) {
			try {
				const formData = new FormData();
				formData.append('avatar', avatar);
				await profileService.uploadAvatarImage(formData);
				alert = imageSuccess.update;
			} catch (error) {
				alert = imageAlerts.error;
			}
		} else {
			alert = imageSuccess.already;
		}
	}

	async function onProfileUpload() {
		resetAlerts();
		try {
			await profileService.updateProfile(tempProfile);
			profileAlert = profileSuccess.update;
		} catch (error) {
			if (isAxiosError(error)) {
				console.log(error);
				if (error.response?.status == 406) {
					profileAlert = profileAlerts.unavaliable;
				}
			} else {
				profileAlert = profileAlerts.error;
			}
		}
	}

	function resetAlerts() {
		alert = imageAlerts.none;
		profileAlert = profileAlerts.none;
	}
	async function onDelete() {
		await profileService.deleteAccount();
		goto('/deleted');
	}

	async function onTwoFactorAuth() {
		if (!tfaEnabled) {
			goto('/enable2fa');
		} else {
			await authService.disable2FA();
			message = 'Two Factor Authentication disabled!';
			auth = useAuth();
		}
	}
	let message = '';
	$: tfaEnabled = $auth.session?.otpEnabled;

	$: tempProfile, resetAlerts();
	$: avatar, resetAlerts();
</script>
<div class="w-screen h-full min-h-screen">
<PongHeader />
<div class="flex flex-col justify-end items-end">
	<a href="/dashboard"><i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" /></a>
</div>
<div class="grid md:grid-cols-2 grid-cols-1 gap-10 m-10">
	<div class="border-4 p-10 rounded-lg flex flex-col items-center gap-10 h-fit">
		{#await profile then}
			<p class="md:text-3xl text-2xl ">Edit Your Profile</p>
			<div
				class={`flex flex-col items-start w-full ${
					profileAlert == profileAlerts.unavaliable ? 'text-red-500 border-red-500' : ''
				}`}
			>
				<p class="md:text-2xl text-xl pb-5">Nickname</p>
				<input class="input-primary" bind:value={tempProfile.nickname} on:change={resetAlerts} />
			</div>
			<div class="flex w-full items-center flex-col text-xl gap-4">
				<p
					class={Object.values(profileAlerts).indexOf(profileAlert) > -1
						? 'text-red-500 '
						: 'text-emerald-500'}
				>
					{profileAlert}
				</p>
				<button class="btn-primary md:w-1/4 w-full min-w-fit " on:click={onProfileUpload}> Save </button>
			</div>
		{/await}
	</div>

	<div class="border-4 p-10 rounded-lg flex flex-col justify-center items-center gap-4">
		<p class="md:text-3xl text-2xl mb-2">Update Avatar Profile</p>
		<div class="flex md:flex-row flex-col items-center justify-center gap-10">
			<div class="aspect-square items-center justify-center w-32 md:w-24">
				{#await loading}
					<Image />
				{:then}
					{#if avatar}
						<img class="avatar" src={URL.createObjectURL(avatar)} alt="avatar" />
					{:else}
						<Image />
					{/if}
				{/await}
			</div>
			<div class="flex flex-row items-center justify-center ">
				<button
					class="cursor-pointer flex flex-row justify-center items-center upload-image md:w-full w-1/3 text-xl min-w-fit"
					on:click={() => {
						fileInput.click();
					}}
				>
					<Camera />
					Choose Image
				</button>

				<input
					type="file"
					style="display:none"
					accept=".png, .jpeg, .jpg"
					on:change={onFileSelected}
					bind:this={fileInput}
				/>
			</div>
		</div>
		<p class="text-xs">Send png, jpg or jpeg up to 1Mb</p>
		<div class="flex w-full items-center flex-col text-xl gap-4">
			<p
				class={Object.values(imageAlerts).indexOf(alert) > -1
					? 'text-red-500 '
					: 'text-emerald-500'}
			>
				{alert}
			</p>
			<button class="btn-primary md:w-1/4 w-full min-w-fit " on:click={onUpdateImage}> Save </button>
		</div>
	</div>
</div>
<div class="flex flex-row justify-center items-center p-10 gap-10">
	
	<button class="btn-primary w-fit md:text-2xl text-xs" on:click={onTwoFactorAuth}>
		{!tfaEnabled ? 'Enable' : 'Disable'} Two Factor Authentication
	</button>
	<button class="btn-deleted w-fit md:text-2xl text-xs" on:click={onDelete}>delete account</button>
	
</div>
<div class="h-12 text-green-500 text-2xl text-center w-full">
	{message}
</div>
</div>
