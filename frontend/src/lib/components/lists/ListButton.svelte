<script lang="ts">
	export let type:
		| 'chat'
		| 'play'
		| 'block'
		| 'friend'
		| 'unblock'
		| 'join'
		| 'leave'
		| 'mute'
		| 'unmute'
		| 'add-member'
		| 'turn-admin'
		| 'remove-admin'
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
		'add-member': {
			img: '/adicionar-usuario.png',
			alt: 'add member',
			text: 'ADD'
		},
		'turn-admin': {
			img: '/adicionar-usuario.png',
			alt: 'turn admin',
			text: 'TURN ADMIN'
		},
		'remove-admin': {
			// TODO: corrigir corrigir icon
			img: '/botao-excluir.png',
			alt: 'remove admin',
			text: 'REMOVE ADMIN'
		},
		kick: {
			// TODO: corrigir corrigir icon
			img: '/botao-excluir.png',
			alt: 'kick this member',
			text: 'KICK'
		},
		mute: {
			// TODO: corrigir corrigir icon
			img: '/audio-mudo.png',
			alt: 'mute this member',
			text: 'MUTE'
		},
		unmute: {
			// TODO: corrigir corrigir icon
			img: '/microfone.png',
			alt: 'unmute this member',
			text: 'UNMUTE'
		}
	};
</script>

<button class="w-10 xl:w-12 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1" on:click>
	<img src={typeObject[type].img} alt={typeObject[type].alt} class="w-8 mx-auto" />
	<p class="max-xl:text-xs lg:text-xs text-center">{typeObject[type].text}</p>
</button>
