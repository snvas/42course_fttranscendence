<script lang="ts">
	import { deleteGroupChatPassword, updateGroupChatPassword } from '$lib/api';
	import type { GroupChatDto } from '$lib/dtos';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const options = ['public', 'private'];

	export let configGroup: GroupChatDto | null;

	const alerts = {
		none: null,
		empty: "can't be empty"
	};
	let alertPassword: string | null = null;

	let visibility = configGroup!.visibility;
	let password = '';
	let isLoading = false;
	let updated = false;

	async function onUpdatePassword() {
		console.log(visibility, password);
		if (updated) {
			configGroup = null;
		}
		isLoading = true;
		if (visibility == 'private') {
			if (password == '') {
				alertPassword = alerts['empty'];
				return;
			}
			let res = await updateGroupChatPassword(configGroup!.id, password);
			if (res == true) {
				updated = true;
			}
		} else {
			let res = await deleteGroupChatPassword(configGroup!.id);
			if (res == true) {
				updated = true;
			}
		}
		isLoading = false;
	}
</script>

<div class="w-full h-full flex flex-row gap-10">
	<div class="border-4 border-white w-full h-full flex flex-col rounded-3xl p-5">
		<div class="flex flex-row justify-end">
			<button on:click={() => (configGroup = null)}>
				<div class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" />
			</button>
		</div>
		<div class="flex flex-row justify-center p-5">
			<h1 class="text-center text-yellow-500 text-3xl">{configGroup?.name}</h1>
			<hr />
		</div>

		<div class="w-full h-full flex flex-col overflow-y-auto">
			<h2 class="text-center text-2xl">Set Group Visibility</h2>
			<div class="flex flex-col gap-5 p-10">
				{#each options as value}
					<label class="text-xl flex items-center cursor-pointer">
						<input type="radio" class="sr-only" {value} bind:group={visibility} disabled={updated} />
						<span class="w-6 h-6 border rounded-full mr-2 flex items-center justify-center">
						<span class="w-3 h-3 rounded-full {value == visibility ? 'bg-green-500' : 'bg-slate-700 '}"></span></span>
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
						class="text-center w-full text-xs border-2 rounded-md h-12 bg-inherit disabled:text-gray-500 disabled:bg-gray-800
								{alertPassword ? 'border-red-500 border-4' : 'border-white'} "
						bind:value={password}
						on:change={() => (alertPassword = null)}
					/>
				</div>
				<div class="flex flex-col justify-center w-full">
					<p
						class="text-green-500 md:text-2xl text-base w-full text-center {updated
							? 'block'
							: 'invisible'}"
					>
						Group successfully updated!
					</p>
					<button
						class="btn-primary text-center md:text-2xl text-base min-w-fit p-4 {isLoading
							? 'cursor-wait'
							: ''}"
						disabled={(configGroup?.visibility == 'public' && visibility == 'public') ||
							(configGroup?.visibility == 'private' && visibility == 'private' && password == '')}
						on:click={onUpdatePassword}
					>
						{updated ? 'Go to it!' : 'Update'}
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
