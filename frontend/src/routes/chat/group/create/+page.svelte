<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { socket } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import type { GroupChatDto } from '$lib/dtos';
	import { isAxiosError, type AxiosResponse } from 'axios';
	import { chatService } from '$lib/api';

	onDestroy(() => {
		$socket.off('receivePrivateMessage');
	});

	let options = ['public', 'private'];

	let name = '';
	let visibility = 'public';
	let password = '';

	const alerts = {
		none: null,
		empty: "can't be empty",
		exist: 'already exists'
	};

	let alertName: string | null = null;
	let alertPassword: string | null = null;
	let createdGroup: AxiosResponse<GroupChatDto, any>;
	let isLoading = false;
	let created = false;

	async function onCreateGroup() {
		if (created) {
			goto('/chat/group');
			// TODO: store para guardar e mandar para o grupo correto
			return;
		}
		isLoading = true;
		alertName = null;
		alertPassword = null;

		if (name == '' || (visibility == 'private' && password == '')) {
			if (name == '') {
				alertName = alerts.empty;
			}
			if (visibility == 'private' && password == '') {
				alertPassword = alerts.empty;
			}
			isLoading = false;
			return null;
		}

		try {
			if (visibility == 'private') {
				createdGroup = await chatService.createGroupChat({ name, visibility, password });
			} else {
				createdGroup = await chatService.createGroupChat({ name });
			}
			created = true;
		} catch (error) {
			if (isAxiosError(error)) {
				console.log(error);
				if (error.response?.status == 406) {
					alertName = alerts.exist;
				} else {
					console.log('unknown error');
				}
			}
		}

		isLoading = false;
	}
</script>

<div class="w-screen h-full min-h-screen">
	<PongHeader />
	<div class="flex flex-col justify-end items-end">
		<a href="/chat/group">
			<i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" />
		</a>
	</div>
	<div class="w-full flex flex-row gap-10 border-4 border-white rounded-3xl mt-20 p-5">
		<div class="flex flex-col w-full items-center gap-3 p-10">
			<h1 class="text-white">Create a Group</h1>
			<div class="w-4/5 lg:w-2/4">
				<p class="text-red-500 {alertName ? 'block' : 'invisible'}">{alertName}</p>
				<input
					type="text"
					class="input-primary {alertName ? 'border-red-500' : ''}"
					placeholder="Group Name"
					bind:value={name}
					on:change={() => (alertName = null)}
					disabled={created}
				/>
			</div>
			<div class="border-4 border-white p-5 rounded-lg w-4/5 lg:w-2/4">
				<h2 class="text-center">Set Group Visibility</h2>
				<div class="flex flex-col gap-5 p-10">
					{#each options as value}
						<label class="text-xl">
							<input type="radio" {value} bind:group={visibility} disabled={created} />
							{value}
						</label>
					{/each}
					<div
						class="flex-initial w-1/2 -mt-3
						{visibility == 'public' ? 'invisible' : 'block'}"
					>
						<p class="text-red-500 transition-all {alertPassword ? 'block' : 'invisible'}">
							{alertPassword}
						</p>
						<input
							type="text"
							placeholder="Password"
							disabled={created}
							class="text-center w-full text-xs border-2 rounded-md h-12 bg-inherit disabled:text-gray-500 disabled:bg-gray-800
								{alertPassword ? 'border-red-500 border-4' : 'border-white'} "
							bind:value={password}
							on:change={() => (alertPassword = null)}
						/>
					</div>
					<div class="flex flex-col justify-center w-full">
						<p
							class="text-green-500 md:text-2xl text-base w-full text-center {created
								? 'block'
								: 'invisible'}"
						>
							Group successfully created!
						</p>
						<button
							class="btn-primary text-center md:text-2xl text-base min-w-fit p-4 {isLoading
								? 'cursor-wait'
								: ''}"
							disabled={isLoading}
							on:click={onCreateGroup}
						>
							{created ? 'Go to it!' : 'Create'}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
