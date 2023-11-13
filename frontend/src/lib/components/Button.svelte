<script lang="ts">
	export let type: 'logout' | 'chat' | 'history' | 'settings' | 'play' = 'history';

	export const icons = {
		history: 'fa fa-history',
		settings: 'fa fa-cog',
		play: 'fa fa-play',
		chat: 'fa fa-comments',
		logout: 'fa fa-sign-out'
	};

	const title = {
		history: 'show history',
		settings: 'show settings',
		chat: 'show chat',
		play: 'Play game!',
		logout: 'show logout'
	};

	const style = {
		history: 'smallButton history',
		settings: 'smallButton settings',
		chat: 'bigButton chat',
		play: 'bigButton play',
		logout: 'smallButton logout'
	};

	let clicked = false;

</script>

<div class="w-full flex justify-around  flex-row gap-3">
<button class={`hover:scale-110 transition-all ${style[type]} ${clicked ? 'bg-gray-300' : ''}`} title={title[type]} on:click={() => clicked = !clicked} on:click>
		<span class={icons[type]} />
	</button>
</div>

