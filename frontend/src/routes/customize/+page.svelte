<script lang="ts">
	import redTable from "$lib/assets/red.png"
	import blackTable from "$lib/assets/black.png"
	import blueTable from "$lib/assets/blue.png"
	import greenTable from "$lib/assets/green.png"
	import pinkTable from "$lib/assets/pink.png"
	import yellowTable from "$lib/assets/yellow.png"
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/stores';
	import PongHeader from '$lib/components/PongHeader.svelte';

	let auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	}

	function saveBackgroundColor(color: string) {
		localStorage.setItem('backgroundColor', color)
		backgroundColorSelected = color;
	}

	function saveBoardColor(color: string) {
		localStorage.setItem('boardColor', color)
		boardColorSelected = color;
	}

	const boardColors = ["white", "red", "orange", "yellow", "blue", "violet", "pink", "green"];
	const backgroundColors = ["black", "red", "blue", "green", "pink", "yellow"];
	const backgroundColorsSrc = [blackTable, redTable, blueTable, greenTable, pinkTable, yellowTable];
	let backgroundColorSelected = localStorage.getItem("backgroundColor") || "black";
	let boardColorSelected = localStorage.getItem("boardColor") || "white";
</script>

<style>
	#whiteBoardOption {
		color: black;
	}

	#whiteBoardOption {
		background-color: #f8fafc;
	}

	#redBoardOption {
		background-color: #ef4444;
	}

	#orangeBoardOption {
		background-color: #f97316;
	}

	#yellowBoardOption {
		background-color: #eab308;
	}

	#blueBoardOption {
		background-color: #06b6d4;
	}

	#violetBoardOption {
		background-color: #8b5cf6;
	}

	#pinkBoardOption {
		background-color: #ec4899;
	}

	#greenBoardOption {
		background-color: #22c55e;
	}
</style>

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
				{#each backgroundColors as color, i}
					{#if backgroundColorSelected == color}
						<button id="{color}BackgroundOption" on:click={() => {saveBackgroundColor(color)}}>
							<img src={backgroundColorsSrc[i]} alt="Game {color} background color" class="w-48 h-38 m-4 border-4 border-green-600">
						</button>
					{:else}
						<button id="{color}BackgroundOption" on:click={() => {saveBackgroundColor(color)}}>
							<img src={backgroundColorsSrc[i]} alt="Game {color} background color" class="w-48 h-38 m-4 border-4">
						</button>
					{/if}
				{/each}
			</div>
		</div>

		<div class="border-4 p-10 rounded-lg flex flex-col items-center gap-10">
			<p class="md:text-3xl text-2xl">Pick your board's color</p>
			<div class="grid grid-cols-2 gap-6 h-full justify-center">
				{#each boardColors as color}
					{#if boardColorSelected == color}
						<button id="{color}BoardOption" class="btn-op w-40 border-8 border-green-600" on:click={() => {saveBoardColor(color)}}>
							{color}
						</button>	
					{:else}
						<button id="{color}BoardOption" class="btn-op w-40" on:click={() => {saveBoardColor(color)}}>
							{color}
						</button>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>
