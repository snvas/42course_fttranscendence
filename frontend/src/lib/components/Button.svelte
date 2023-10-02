<script lang="ts">
	export let type: 'logout' | 'stats' | 'history' | 'settings' | 'play' = 'stats';

	export const icons = {
		stats: 'fa fa-bar-chart',
		history: 'fa fa-history',
		settings: 'fa fa-cog',
		play: 'fa fa-play',
		logout: 'fa fa-sign-out'
	};

	const title = {
		stats: 'show stats',
		history: 'show history',
		settings: 'show settings',
		play: 'Play game!',
		logout: 'show logout'
	};

	const style = {
		stats: 'small stats',
		history: 'small history',
		settings: 'small settings',
		play: 'play',
		logout: 'small logout'
	};
</script>

<div class="w-full min-w-fit">
	<button class={`hover:scale-110 transition-all ${style[type]}`} title={title[type]} on:click>
		<span class={icons[type]} />
	</button>
</div>

<style>
	.small {
		width: 60px;
		height: 60px;
		border-radius: 30px;
		font-size: 2.5vh;
		margin-left: 0.5%;
		margin-right: 0.5%;
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

	.logout {
		background-color: rgb(34, 34, 34);
		color: white;
		font-size: 3.5vh;
	}

	.play {
		/* Defina os estilos do botão Play aqui */
		background-color: red;
		color: white;
		width: 100px;
		height: 100px;
		border-radius: 60px;
		margin-left: 0.5%;
		margin-right: 0.5%;
		font-size: 4vh;
	}
</style>
