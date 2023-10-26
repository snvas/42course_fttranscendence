<script lang="ts">
	import type {GroupProfileDto} from '$lib/dtos'

	export let members: GroupProfileDto[]

</script>

<div class="border-4 border-white h-full flex flex-col flex-none w-1/3 p-5 rounded-3xl">
	MEMBERS
	{#each members as member}
		<div>
			{member.profile.nickname}
		</div>
	{/each}
</div>