<script lang="ts">
	import { goto } from '$app/navigation';
	import { authService } from '$lib/api';
	import { verifyUnautorized } from '$lib/utils';
	import { socket } from '$lib/stores';
	import PongHeader from '$lib/components/PongHeader.svelte';

	async function onConfirmLogin() {
		try {
			await authService.destroyOldUserSessions();
			goto('/dashboard');
			return true;
		} catch (error) {
			verifyUnautorized(error);
		}
	}

	async function onLogout() {
		try {
			$socket.disconnect();
			await authService.logoutUser();
		} catch (error) {
			verifyUnautorized(error);
		}
	}
</script>

<PongHeader />

<div class="relative z-10">
	<div class="fixed inset-0 bg-gray-900 bg-opacity-95 transition-opacity" />

	<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
				class="relative transform overflow-hidden rounded-lg bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
			>
				<div class="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
					<div class="flex flex-col w-full h-full mx-auto">
						<div class="flex flex-col mx-auto items-center gap-10 border-4 p-10 rounded-lg w-full">
							<h1 class="text-xl text-center">
								<span class="text-yellow-500" />
								You will be disconnected from other devices
								<br />
								Are, you sure?
							</h1>
							<div class="flex flex-row gap-6 w-full">
								<button class="btn-deleted" on:click={onConfirmLogin}>Yes, Sure</button>
								<button class="btn-primary" on:click={onLogout}>Exit</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
