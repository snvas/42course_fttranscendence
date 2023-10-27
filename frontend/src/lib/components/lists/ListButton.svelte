<script lang="ts">
	export let type:
		| 'chat'
		| 'play'
		| 'block'
		| 'friend'
		| 'unblock'
		| 'join'
		| 'leave'
		| 'addMember'
		| 'kick';

	const typeObject: { [index: string]: { img: string; alt: string; text: string } } = {
		chat: {
			img: '/bate-papo-de-texto.png',
			alt: "let's chat",
			text: 'CHAT'
		},
		block: {
			img: '/bloqueado.png',
			alt: 'block this user',
			text: 'BLOCK'
		},
		play: {
			img: '/pingue-pongue.png',
			alt: "let's play",
			text: 'PLAY'
		},
		friend: {
			img: '/adicionar-usuario.png',
			alt: 'add friend',
			text: 'FRIEND'
		},
		unblock: {
			// TODO: outro icon
			img: '/bloqueado.png',
			alt: 'unblock this user',
			text: 'UNBLOCK'
		},
		join: {
			// TODO: corrigir icon
			img: '/bate-papo-de-texto.png',
			alt: 'join this group',
			text: 'JOIN'
		},
		leave: {
			// TODO: corrigir corrigir icon
			img: '/bloqueado.png',
			alt: 'leave this group',
			text: 'LEAVE'
		},
		addMember: {
			img: '/adicionar-usuario.png',
			alt: 'add member',
			text: 'ADD'
		},
		kick: {
			// TODO: corrigir corrigir icon
			img: '/botao-excluir.png',
			alt: 'kick this member',
			text: 'KICK'
		}
	};
</script>

<button class="w-8 xl:w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1" on:click>
	<img src={typeObject[type].img} alt={typeObject[type].alt} />
	<p class="text-center max-xl:text-xs">{typeObject[type].text}</p>
</button>
