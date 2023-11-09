<script lang="ts">
	import redTable from "$lib/assets/red.png"
	import blackTable from "$lib/assets/black.png"
	import blueTable from "$lib/assets/blue.png"
	import greenTable from "$lib/assets/green.png"
	import pinkTable from "$lib/assets/pink.png"
	import yellowTable from "$lib/assets/yellow.png"
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/stores';
	import { getProfile, getUserAvatar, profileService, authService } from '$lib/api';

	import PongHeader from '$lib/components/PongHeader.svelte';
	import Image from '$lib/components/Image.svelte';
	import Camera from '$lib/components/Camera.svelte';
	import type { ProfileDTO } from '$lib/dtos';
	import { isAxiosError } from 'axios';
	import { validateNicknameInput } from '$lib/utils';

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
			goto('/login');
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
			let validated = validateNicknameInput(tempProfile.nickname!)
			if (validated != true) {
				profileAlert = validated;
				return;
			}
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
		<a href="/dashboard">
			<i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" />
		</a>
	</div>
	<div class="grid md:grid-cols-2 grid-cols-1 gap-10 m-10">
		<div class="border-4 p-10 rounded-lg flex flex-col items-center gap-10 h-fit">
			<p class="md:text-3xl text-2xl">Choose a map</p>

			<div class="grid grid-cols-2 gap-3 h-full justify-center">
				<button class="menu-option" id="option2">
					<img src={blackTable} alt="Option 2" class="w-48 h-38 m-4 border-8 border-green-600">
				</button>

				<button class="menu-option" id="option2">
					<img src={redTable} alt="Option 2" class="w-48 h-38 m-4 border-4">
				</button>

				<button class="menu-option" id="option2">
					<img src={blueTable} alt="Option 2" class="w-48 h-38 m-4 border-4">
				</button>

				<button class="menu-option" id="option2">
					<img src={greenTable} alt="Option 2" class="w-48 h-38 m-4 border-4">
				</button>

				<button class="menu-option" id="option2">
					<img src={pinkTable} alt="Option 2" class="w-48 h-38 m-4 border-4">
				</button>

				<button class="menu-option" id="option2">
					<img src={yellowTable} alt="Option 2" class="w-48 h-38 m-4 border-4">
				</button>
			</div>
		</div>

		<div class="border-4 p-10 rounded-lg flex flex-col items-center gap-10">
			<p class="md:text-3xl text-2xl">Pick your board's color</p>
			<div class="grid grid-cols-2 gap-6 h-full justify-center">
				<button class="btn-op bg-[#f8fafc] w-40 text-[#020617] border-8 border-green-600" on:click={onUpdateImage}>
					White
				</button>
				<button class="btn-op bg-[#ef4444] w-40" on:click={onUpdateImage}>
					Red
				</button>
				<button class="btn-op bg-[#f97316] w-40" on:click={onUpdateImage}>
					Orange
				</button>
				<button class="btn-op bg-[#eab308] w-40" on:click={onUpdateImage}>
					Yellow
				</button>
				<button class="btn-op bg-[#06b6d4] w-40" on:click={onUpdateImage}>
					Blue
				</button>
				<button class="btn-op bg-[#8b5cf6] w-40" on:click={onUpdateImage}>
					Violet
				</button>
				<button class="btn-op bg-[#ec4899] w-40" on:click={onUpdateImage}>
					Pink
				</button>
				<button class="btn-op bg-[#22c55e] w-40" on:click={onUpdateImage}>
					Green
				</button>
			</div>
		</div>
	</div>
</div>
