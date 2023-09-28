<script lang="ts">
	import { goto } from '$app/navigation';
	import Image from '$lib/components/Image.svelte';
	import Camera from '$lib/components/Camera.svelte';
	import PongHeader from '$lib/components/PongHeader.svelte';

	function onWelcome() {
		//goto('http://localhost:3001/');
		nickname = false;
	}

	function avatarImage() {
		goto('http://localhost:3001/');
	}

	let avatar, fileInput;

	const onFileSelected = (e) => {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			avatar = e.target.result;
		};
	};

	let nickname = true;
</script>

<div class="gap-20 flex flex-col pt-10 items-center">
	<PongHeader/>
</div>
<div class="w-2/3 mx-auto">
	<div class="gap-5 flex flex-col pt-10 items-center">
		<p class="text-3xl mt-20 mb-10">Welcome to Pong!</p>

		{#if nickname}
			<input placeholder="Choose your nickname" class="input-primary" />
			<button class="btn-primary w-1/4" on:click={onWelcome}> Submit </button>
		{:else}
		
		{#if avatar}
		<img class="avatar" src={avatar} alt="d" />
		{:else}
			<Image />
				{/if}
				<div class="w-full flex flex-row gap-2 items-center justify-center">
					
					
					<div class="cursor-pointer flex flex-row justify-center items-center" on:click={() => {fileInput.click();}}>
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
				<button class="btn-primary w-1/4" on:click={avatarImage}> Submit </button>
			
				{/if}
			</div>
			
</div>
