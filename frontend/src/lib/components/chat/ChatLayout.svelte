<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { useAuth, socket, profile } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { getProfile } from '$lib/api';

	const auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		$socket.disconnect();
		goto('/login');
	}

	let loadProfile = getProfile();

	loadProfile.then((v) => {
		if (!v) {
			$socket.disconnect();
			goto('/login');
		} else {
			$profile = v.data;
		}
	});

	export let selected: 'direct' | 'group';
</script>

<div class="h-full min-h-screen w-screen flex flex-col lg:h-screen gap-5">
	<div class="flex-none">
		<PongHeader />
		<div class="flex flex-col justify-end items-end">
			<a href="/dashboard">
				<i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" />
			</a>
		</div>
	</div>
	<div class="flex-1 flex flex-col lg:flex-row gap-5 px-10 pb-10 h-0">
		<div class="gap-15 flex flex-col lg:w-1/4 flex-none w-full h-full sm:order-first order-last">
			<div class="border-4 border-white w-full flex flex-col md:max-h-full h-full max-h-96 rounded-3xl flex-none">
				<div class="flex-none flex flex-row gap-4 px-4 py-2">
					<button
						class="border-2 border-white h-10 flex-1 items-center justify-center rounded-xl {selected ==
						'direct'
							? 'text-green-500 '
							: ''}"
						on:click={() => {
							goto('/chat/direct');
						}}
					>
						<p class="text-center text-sm">Direct Messages</p>
					</button>
					<button
						class="border-2 border-white h-10 flex-1 items-center justify-center rounded-xl {selected ==
						'group'
							? 'text-green-500 '
							: ''}"
						on:click={() => {
							goto('/chat/group');
						}}
					>
						<p class="">Groups</p>
					</button>
				</div>
				<slot name="list" />
			</div>
		</div>
		<div class="flex-1 flex flex-col h-full w-full lg:w-1/4 ">
			<slot name="messages" />
		</div>
	</div>
</div>

<style>
	.icon-link {
		color: whitesmoke;
	}
</style>
