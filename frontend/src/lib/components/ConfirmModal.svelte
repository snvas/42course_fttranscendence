<script lang="ts">
	import type { MatchEventDto } from '$lib/dtos';

	export let status: 'waiting-confirm' | 'confirm' = "confirm";
	export let match: MatchEventDto;

	export let rejectMatch: () => {};
	export let confirmMatch: () => {};
</script>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div class="fixed inset-0 bg-gray-900 bg-opacity-95 transition-opacity" />

	<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
				class="relative transform overflow-hidden rounded-lg bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
			>
				<div class="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
					<div class="flex flex-col w-full h-full mx-auto">
						{#if status == 'confirm'}
							<div
								class="flex flex-col mx-auto items-center gap-10 border-4 p-10 rounded-lg w-full"
							>
								<h1 class="text-xl text-center">
									<span class="text-yellow-500">
										{match?.as == 'p1' ? match.p2.nickname : match?.p1.nickname}
									</span>
									invited you for a game
									<br />
									start game?
								</h1>
								<div class="flex flex-row gap-6 w-full">
									<button class="btn-deleted" on:click={rejectMatch}>not now</button>
									<button class="btn-primary" on:click={confirmMatch}>Yeah, let's play</button>
								</div>
							</div>
						{:else if status == 'waiting-confirm'}
							<div class="flex flex-col mx-auto items-center gap-10 border-4 p-10 rounded-lg">
								<h1 class="text-xl text-center">Waiting opponent confirm...</h1>
								<button class="btn-deleted" on:click={rejectMatch}>Cancel</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
