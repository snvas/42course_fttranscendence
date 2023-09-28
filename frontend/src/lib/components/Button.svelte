<script lang="ts">
	export let type: 'stats' | 'history' | 'settings' | 'play' = 'stats';

	export const icons = {
		stats: 'fa fa-bar-chart',
		history: 'fa fa-history',
		settings: 'fa fa-cog',
		play: 'fa fa-play'
	};

	const label = {
		stats: 'Stats',
		history: 'History',
		settings: 'Settings',
		play: 'Play'
	};
</script>

<button class={`hover:scale-110 transition-all ${type}`}>
	<span class={icons[type]} />
		<span>{label[type]}</span>
</button>

<style>
	.stats {
		/* Defina os estilos do botão Stats aqui */
		background-color: blue;
		color: white;
		width: 50px;
		height: 50px;
		border-radius: 30px;
	}

	.history {
		/* Defina os estilos do botão History aqui */
		background-color: green;
		color: white;
		width: 50px;
		height: 50px;
		border-radius: 30px;
	}

	.settings {
		/* Defina os estilos do botão Settings aqui */
		background-color: yellow;
		color: black;
		width: 50px;
		height: 50px;
		border-radius: 30px;
	}

	.play {
		/* Defina os estilos do botão Play aqui */
		background-color: red;
		color: white;
		width: 100px;
		height: 100px;
		border-radius: 60px;
	}
</style>
