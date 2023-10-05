<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/stores';
	import { getProfile, getUserAvatar, profileService } from '$lib/api';

	import PongHeader from '$lib/components/PongHeader.svelte';
	import Image from '$lib/components/Image.svelte';
	import Camera from '$lib/components/Camera.svelte';
	import type { ProfileDTO } from '../../../../backend/src/profile/models/profile.dto';

	let auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	}

	const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

	const imageAlerts = {
		none: '',
		size: 'image is too big',
		type: 'invalid type',
		error: 'unknown error'
	};

	const imageSuccess = {
		update: 'image is updated!',
		already: 'this image already is your avatar!'
	};

	const profileAlerts = {
		none: '',
		error: 'unknown error'
	};

	const profileSuccess = {
		update: 'profile is updated!'
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
			profileAlert = profileAlerts.error;
		}
	}

	function resetAlerts() {
		alert = imageAlerts.none;
		profileAlert = profileAlerts.none;
	}

	$: tempProfile, resetAlerts();
	$: avatar, resetAlerts();

	$: console.log(tempProfile);
</script>

<PongHeader />
<div class="border-4 m-10 mx-20 p-10 rounded-lg flex flex-col justify-center items-center gap-4">
	<p class="text-3xl mb-10">Update Avatar Profile</p>
	<div class="w-48 aspect-square">
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
	<div class="w-full flex flex-row gap-2 items-center justify-center">
		<button
			class="cursor-pointer flex flex-row justify-center items-center upload-image w-1/2"
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
	<p class="text-xs mb-2">Send png, jpg or jpeg up to 1Mb</p>
	<div class="flex w-full items-center flex-col">
		<p
			class={Object.values(imageAlerts).indexOf(alert) > -1 ? 'text-red-500 ' : 'text-emerald-500'}
		>
			{alert}
		</p>
		<button class="btn-primary w-1/4" on:click={onUpdateImage}> Save </button>
	</div>
</div>

<div class="border-4 m-10 mx-20 p-10 rounded-lg flex flex-col justify-center items-center gap-10">
	{#await profile then}
		<p class="text-3xl">Edit Your Profile</p>
		<div class="flex flex-col items-start w-full">
			nickname
			<input class="input-primary" bind:value={tempProfile.nickname} on:change={resetAlerts} />
		</div>
		<div class="flex w-full items-center flex-col">
			<p
				class={Object.values(profileAlerts).indexOf(profileAlert) > -1
					? 'text-red-500 '
					: 'text-emerald-500'}
			>
				{profileAlert}
			</p>
			<button class="btn-primary w-1/4" on:click={onProfileUpload}> Save </button>
		</div>
	{/await}
</div>
