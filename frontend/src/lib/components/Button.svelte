<script lang="ts">
	export let tipo: 'stats' | 'history' | 'settings' | 'play' = 'stats';

 export const icons = {
	stats: "fa-solid fa-chart-simple",
	history: "fa-solid fa-clock-rotate-left",
	settings: "fa-solid fa-gear",
	play: "fa-solid fa-play",
  };
</script>
  <button class={tipo}>
	<span class={icons[tipo]}></span>
	{#if tipo === 'stats'}
	  <!-- Coloque o ícone de Stats aqui -->
	  <span>Stats</span>
	{:else if tipo === 'history'}
	  <!-- Coloque o ícone de History aqui -->
	  <span>History</span>
	{:else if tipo === 'settings'}
	  <!-- Coloque o ícone de Settings aqui -->
	  <span>Settings</span>
	{:else if tipo === 'play'}
	  <!-- Coloque o ícone de Play aqui -->
	  <span>Play</span>
	{/if}
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