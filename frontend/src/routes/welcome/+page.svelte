<script lang="ts">
	import { goto } from '$app/navigation';
	import Image from '$lib/components/Image.svelte';
	import Camera from '$lib/components/Camera.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { profileService } from '$lib/api';
	import { isAxiosError } from 'axios';
	import { validateNicknameInput } from '$lib/utils';

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
			let validated = validateNicknameInput(nickname);
			if (validated != true) {
				alert = validated;
				isLoading = false;
				return;
			}
			await profileService.createProfile(nickname);
			alert = alerts.none;
			inputNickname = false;
		} catch (error) {
			if (isAxiosError(error)) {
				if (error.response?.status == 400) {
					alert = alerts.profileExist;
				} else if (error.response?.status == 406) {
					alert = alerts.alreadyExist;
				} else {
					goto('/login');
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
</script>

<div class="w-screen h-full min-h-screen">
	<PongHeader />
	<div class="w-2/3 mx-auto">
		<div class="flex flex-col items-center gap-10 mt-20">
			<p class="text-3xl">Welcome to Pong!</p>

			{#if inputNickname}
				<form class="flex flex-col gap-10 items-center">
					<div class="flex flex-col justify-center items-center">
						<p class="text-red-500">
							{alert}
						</p>
						<input
							bind:value={nickname}
							placeholder="Choose your nickname"
							class={`input-primary w-auto ${alert != alerts.none ? 'border-red-500' : ''}`}
						/>
					</div>
					<button
						disabled={isLoading}
						class="btn-primary w-1/4 min-w-fit"
						on:click={onCreateProfile}
					>
						{alert == alerts.profileExist ? 'Go to home' : 'Submit'}
					</button>
				</form>
			{:else}
				<div class="md:w-48 w-24">
					{#if imageFile}
						<img class="avatar" src={URL.createObjectURL(imageFile)} alt="avatar" />
					{:else}
						<Image />
					{/if}
				</div>
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
				<p class="text-xs">Send png, jpg or jpeg up to 1Mb</p>
				<p class="text-red-500">
					{alert}
				</p>
				<button disabled={isLoading} class="btn-primary w-1/4 min-w-fit" on:click={onUploadImage}>
					{imageFile ? 'Submit' : 'Continue'}
				</button>
			{/if}
		</div>
	</div>
</div>
