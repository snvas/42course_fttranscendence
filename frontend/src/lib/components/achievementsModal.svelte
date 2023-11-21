<script>
	export let show;

	function onCloseModal() {
		$show = 'hide';
	}
</script>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div class="fixed inset-0 bg-gray-900 bg-opacity-95 transition-opacity" />
	<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
			class="relative transform overflow-hidden border-[6px] rounded-lg bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg p-5"
			>
				<div class="flex flex-row justify-between ml-4 mb-5 mr-4">
					<p class="md:text-3xl text-2xl uppercase">All of this can be yours</p>
					<button on:click={onCloseModal}>
						<i class="fa fa-window-close-o md:text-4xl text-3xl icon-link" aria-hidden="true" />
					</button>
				</div>
				<div class="flex flex-row w-full justify-around min-w-fit">
					<div class="flex flex-col achievement achievement-bronze">
						<i class="fa fa-user-plus achievement-icon mb-2" aria-hidden="true"></i>
						<p>ADD +5</p>
						<p>FRIENDS</p>
					</div>
					<div class="flex flex-col achievement achievement-silver">
						<i class="fa fa-user-plus achievement-icon mb-2" aria-hidden="true"></i>
						<p>ADD +15</p>
						<p>FRIENDS</p>
					</div>
					<div class="flex flex-col achievement achievement-gold">
						<i class="fa fa-user-plus achievement-icon mb-2" aria-hidden="true"></i>
						<p>ADD +30</p>
						<p>FRIENDS</p>
					</div>
				</div>
				<div class="flex flex-row w-full justify-around min-w-fit mt-5 mb-5">
					<div class="flex flex-col achievement achievement-bronze">
						<i class="fa fa-trophy achievement-icon mb-2" aria-hidden="true"></i>
						<p>WIN +10<p>
						<p>ROUNDS</p>
					</div>
					<div class="flex flex-col achievement achievement-silver">
						<i class="fa fa-trophy achievement-icon mb-2" aria-hidden="true"></i>
						<p>WIN +30<p>
						<p>ROUNDS</p>
					</div>
					<div class="flex flex-col achievement achievement-gold">
						<i class="fa fa-trophy achievement-icon mb-2" aria-hidden="true"></i>
						<p>WIN +100<p>
						<p>ROUNDS</p>
					</div>
				</div>
				<div class="flex flex-row w-full justify-around min-w-fit">
					<div class="flex flex-col achievement achievement-bronze">
						<i class="fa fa-gamepad achievement-icon mb-2" aria-hidden="true"></i>
						<p>PLAY +10</p>
						<p>FRIENDS</p>
					</div>
					<div class="flex flex-col achievement achievement-silver">
						<i class="fa fa-gamepad achievement-icon mb-2" aria-hidden="true"></i>
						<p>PLAY +30<p>
						<p>ROUNDS</p>
					</div>
					<div class="flex flex-col achievement achievement-gold">
						<i class="fa fa-gamepad achievement-icon mb-2" aria-hidden="true"></i>
						<p>PLAY +100</p>
						<p>MATCHES</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
