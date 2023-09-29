<script lang="ts">
	import { goto } from '$app/navigation';
	import Image from '$lib/components/Image.svelte';
	import Camera from '$lib/components/Camera.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { profileService } from '$lib/api';
	import { isAxiosError } from 'axios';

	const alerts = {
		none: '',
		alreadyExist: 'User name already exists',
		profileExist: 'You already have a profile'
	};

	const imageAlerts = {
		none: '',
		size: 'image is too big',
		type: 'invalid type'
	};

	const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

	let imageFile: File | null = null;
	let fileInput: HTMLInputElement;
	let nickname = '';
	let inputNickname = true;
	let isLoading = false;
	let alert = alerts.none;

	async function onCreateProfile() {
		isLoading = true;
		if (alert == alerts.profileExist) goto('/');
		try {
			await profileService.createProfile(nickname);
			alert = alerts.none;
			inputNickname = false;
		} catch (error) {
			if (isAxiosError(error)) {
				if (error.response?.status == 400) {
					alert = alerts.profileExist;
				}
				if (error.response?.status == 406) {
					alert = alerts.alreadyExist;
				}
			}
		}
		isLoading = false;
	}

	async function onUploadImage() {
		if (imageFile) {
			try {
				const formData = new FormData();
				formData.append('avatar', imageFile);
				await profileService.uploadAvatarImage(formData);
				goto('/');
			} catch (error) {
				goto('/login');
			}
		} else {
			goto('/');
		}
	}

	const onFileSelected = () => {
		let file = fileInput.files![0];
		console.log(file.type);

		if (!allowedTypes.includes(file.type)) {
			alert = imageAlerts.type;
		} else if (file.size > 1024 * 1024) {
			alert = imageAlerts.size;
		} else {
			imageFile = file;
			alert = imageAlerts.none;
		}
	};
	$: console.log(nickname);
</script>

<PongHeader />
<div class="w-2/3 mx-auto">
	<div class="gap-5 flex flex-col pt-10 items-center">
		<p class="text-3xl mt-20 mb-10">Welcome to Pong!</p>

		{#if inputNickname}
			<p class="text-red-500">
				{alert}
			</p>
			<input
				bind:value={nickname}
				placeholder="Choose your nickname"
				class={`input-primary w-auto ${alert != alerts.none ? 'border-red-500' : ''}`}
			/>
			<button disabled={isLoading} class="btn-primary w-1/4" on:click={onCreateProfile}>
				{alert == alerts.profileExist ? 'Go to home' : 'Submit'}
			</button>
		{:else}
			{#if imageFile}
				<img class="avatar" src={URL.createObjectURL(imageFile)} alt="d" />
			{:else}
				<Image />
			{/if}
			<div class="w-full flex flex-row gap-2 items-center justify-center">
				<button
					class="cursor-pointer flex flex-row justify-center items-center"
					on:click={() => {
						fileInput.click();
					}}
				>
					<Camera />
					Choose Image (optional)
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
			<p class="text-red-500">
				{alert}
			</p>
			<button disabled={isLoading} class="btn-primary w-1/4" on:click={onUploadImage}>
				{imageFile ? 'Submit' : 'Continue'}
			</button>
		{/if}
	</div>
</div>
