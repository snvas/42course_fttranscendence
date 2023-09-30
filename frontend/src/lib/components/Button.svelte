<script lang="ts">
	export let type: 'stats' | 'history' | 'settings' | 'play' = 'stats';

	export const icons = {
		stats: 'fa fa-bar-chart',
		history: 'fa fa-history',
		settings: 'fa fa-cog',
		play: 'fa fa-play'
	};

	const title = {
		stats: 'show stats',
		history: 'show history',
		settings: 'show settings',
		play: 'Play game!'
	};

	const style = {
		stats: 'small stats',
		history: 'small history',
		settings: 'small settings',
		play: 'play'
	};
</script>

<div class="w-full min-w-fit">
<button class={`hover:scale-110 transition-all ${style[type]}`} title={title[type]}>
	<span class={icons[type]} />
</button>
</div>
<style>
	.small {
		width: 40px;
		height: 40px;
		border-radius: 30px;
		font-size: 2.5vh;
		margin-left: 1%;
		margin-right: 1%;
	}

	.stats {
		/* Defina os estilos do botão Stats aqui */
		background-color: blue;
		color: white;
	}

	.history {
		/* Defina os estilos do botão History aqui */
		background-color: green;
		color: white;
	}

	.settings {
		/* Defina os estilos do botão Settings aqui */
		background-color: yellow;
		color: black;
	}

	.play {
		/* Defina os estilos do botão Play aqui */
		background-color: red;
		color: white;
		width: 80px;
		height: 80px;
		border-radius: 60px;
		margin-left: 1%;
		margin-right: 1%;
		font-size: 4vh;
	}
</style>
