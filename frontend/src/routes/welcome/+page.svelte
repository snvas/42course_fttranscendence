<script lang="ts">
	import { goto } from '$app/navigation';
	import Image from '$lib/components/Image.svelte';
	import Camera from '$lib/components/Camera.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { profileService } from '$lib/api';

	function onWelcome() {
		//goto('http://localhost:3001/');
		inputNickname = false;
	}

	function avatarImage() {
		goto('http://localhost:3001/');
	}

	let avatar, fileInput;
	let nickname = '';
	let inputNickname = false;
	let isLoading = false;

	async function createProfile() {
		
		await profileService.createProfile(nickname)
	}

	async function onSubmit() {
		isLoading = true;
		if(inputNickname) {
			await createProfile()
		}
		isLoading = false;
	}

	const onFileSelected = (e) => {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			avatar = e.target.result;
		};
	};
</script>

<PongHeader />
<div class="w-2/3 mx-auto">
	<div class="gap-5 flex flex-col pt-10 items-center">
		<p class="text-3xl mt-20 mb-10">Welcome to Pong!</p>

		{#if inputNickname}
			<input
				bind:value={nickname}
				placeholder="Choose your nickname"
				class="input-primary w-auto"
			/>
		{:else}
			{#if avatar}
				<img class="avatar" src={avatar} alt="d" />
			{:else}
				<Image />
			{/if}
			<div class="w-full flex flex-row gap-2 items-center justify-center">
				<div
					class="cursor-pointer flex flex-row justify-center items-center"
					on:click={() => {
						fileInput.click();
					}}
				>
					<Camera />
					Choose Image (optional)
				</div>

				<input
					type="file"
					style="display:none"
					accept=".png, .jpeg, .jpg"
					on:change={(e) => onFileSelected(e)}
					bind:this={fileInput}
				/>
			</div>
			<p class="text-xs mb-2">Send png, jpg or jpeg up to 1Mb</p>
		{/if}
		<button disabled={isLoading} class="btn-primary w-1/4" on:click={onSubmit}> Submit </button>
	</div>
</div>
