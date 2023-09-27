<script lang="ts">
	import { goto } from '$app/navigation';

	let lineClass = 'bg-white h-3 w-full';
	let chunkClass = 'flex flex-col gap-4 w-full';

	function onWelcome() {
		goto('http://localhost:3000/');
	}

	let avatar, fileInput;

	const onFileSelected = (e) => {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			avatar = e.target.result;
		};
	};
</script>
<div class="gap-20 flex flex-col pt-10 items-center">
	<div class="w-full flex flex-row gap-10 items-center">
		<div class={chunkClass}>
			<div class={lineClass} />
			<div class={lineClass} />
		</div>
		<p class="text-6xl">PONG</p>
		<div class={chunkClass}>
			<div class={lineClass} />
			<div class={lineClass} />
		</div>
	</div>
</div>
<div class="w-2/3 mx-auto">
<div class="gap-5 flex flex-col pt-10 items-center">
	<p class="text-3xl mt-20 mb-10">Welcome to Pong!</p>

	<input placeholder="Choose your nickname" class="input-primary" />

	{#if avatar}
		<img class="avatar" src={avatar} alt="d" />
	{:else}
		<svg class="profile-image" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
			><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
				id="SVGRepo_tracerCarrier"
				stroke-linecap="round"
				stroke-linejoin="round"
			/><g id="SVGRepo_iconCarrier">
				<circle cx="12" cy="9" r="3" stroke="#ffffff" stroke-width="1.5" />
				<path
					d="M17.9691 20C17.81 17.1085 16.9247 15 11.9999 15C7.07521 15 6.18991 17.1085 6.03076 20"
					stroke="#ffffff"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
				<path
					d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
					stroke="#ffffff"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</g></svg
		>
	{/if}
	<div class="w-full flex flex-row gap-2 items-center justify-center">
		<svg
			class="upload"
			viewBox="0 0 48 48"
			xml:space="preserve"
			xmlns="http://www.w3.org/2000/svg"
			enable-background="new 0 0 48 48"
			on:click={() => {
				fileInput.click();
			}}
			><path
				d="M34.75 16.558a.35.35 0 0 0 .35-.35v-1.63h1.63a.35.35 0 1 0 0-.7H35.1v-1.63a.35.35 0 0 0-.7 0v1.63h-1.631a.35.35 0 1 0 0 .7h1.63v1.63c0 .194.157.35.35.35zM22.841 31.628c2.153 0 3.904-1.752 3.904-3.904s-1.751-3.904-3.904-3.904-3.904 1.752-3.904 3.904 1.751 3.904 3.904 3.904zm0-7.061c1.741 0 3.158 1.416 3.158 3.157s-1.417 3.157-3.158 3.157-3.158-1.416-3.158-3.157 1.417-3.157 3.158-3.157z"
				fill="#ffffff"
				class="fill-303030"
			/><path
				d="M27.107 26.012c.214.53.338 1.106.338 1.712a4.609 4.609 0 0 1-4.604 4.604 4.609 4.609 0 0 1-4.604-4.604c0-.606.124-1.182.338-1.712H10.92v9.072a1.02 1.02 0 0 0 1.02 1.018h21.79c.57 0 1.031-.462 1.031-1.03v-9.06h-7.654zM33.741 19.338h-5.867l-1.25-2.216a.99.99 0 0 0-.863-.506h-5.84a.99.99 0 0 0-.864.505l-1.25 2.217h-5.878a1.01 1.01 0 0 0-1.009 1.01v4.965h8.016c.813-1.31 2.253-2.192 3.905-2.192 1.652 0 3.092.882 3.904 2.192h8.016v-4.955a1.02 1.02 0 0 0-1.02-1.02z"
				fill="#ffffff"
				class="fill-303030"
			/></svg
		>

		<div on:click={() => {fileInput.click();}}>	Choose Image (optional)</div>
		
		<input
			type="file"
			style="display:none"
			accept=".png, .jpeg, .jpg"
			on:change={(e) => onFileSelected(e)}
			bind:this={fileInput}
		/>
	</div>
	<p class="text-xs mb-2">Send png, jpg or jpeg up to 1Mb</p>
	<button class="btn-primary w-1/4" on:click={onWelcome}> Submit </button>
</div>
</div>