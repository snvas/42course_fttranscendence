<script lang="ts">
	import { goto } from '$app/navigation';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { auth } from '$lib/stores';

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	} else if ($auth.session) {
		goto('/dashboard');
	}

	$: console.log($auth);
</script>

<PongHeader />
