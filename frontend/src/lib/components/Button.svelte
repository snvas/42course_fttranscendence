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
		history: 'small history',
		settings: 'small settings',
		chat: 'chat',
		play: 'play',
		logout: 'small logout'
	};
</script>

<div class="w-full flex justify-around">
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
		width: 90px;
		height: 90px;
		border-radius: 60px;
		font-size: 4vh;
	}

	.chat {
		/* Defina os estilos do botão Play aqui */
		background-color: rgb(246, 184, 16);
		color: white;
		width: 90px;
		height: 90px;
		border-radius: 60px;
		font-size: 4vh;
	}
</style>
