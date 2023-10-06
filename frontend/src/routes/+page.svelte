<script lang="ts">
	import { goto } from '$app/navigation';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { useAuth } from '$lib/stores';

	let auth = useAuth()

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	} else if ($auth.session) {
		goto('/dashboard');
	}

	$: console.log($auth);
</script>

<PongHeader />
