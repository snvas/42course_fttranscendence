<script lang="ts">
	export let type:
		| 'chat'
		| 'play'
		| 'block'
		| 'unblock'
		| 'friend'
		| 'unfriend'
		| 'join'
		| 'leave'
		| 'mute'
		| 'unmute'
		| 'add-member'
		| 'turn-admin'
		| 'remove-admin'
		| 'kick'
		| 'ban'
		| 'unban';

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
			img: '/admin.png',
			alt: 'turn admin',
			text: 'ADMIN'
		},
		'remove-admin': {
			img: '/do-utilizador.png',
			alt: 'remove admin',
			text: 'USER'
		},
		kick: {
			img: '/botao-excluir.png',
			alt: 'kick this member',
			text: 'KICK'
		},
		mute: {
			img: '/audio-mudo.png',
			alt: 'mute this member',
			text: 'MUTE'
		},
		unmute: {
			img: '/microfone.png',
			alt: 'unmute this member',
			text: 'UNMUTE'
		},
		ban: {
			img: '/banir-usuario.png',
			alt: 'ban this member',
			text: 'BAN'
		},
		unban: {
			img: '/banir-usuario.png',
			alt: 'unban this member',
			text: 'UNBAN'
		},
		unfriend: {
			// TODO: atualizar icone
			img: '/do-utilizador.png',
			alt: 'remove friend',
			text: 'FRIEND'
		}
	};
</script>

<button class="w-8 xl:w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1" on:click>
	<img src={typeObject[type].img} alt={typeObject[type].alt} class="w-6 mx-auto" />
	<p class="text-xs text-center">{typeObject[type].text}</p>
</button>
