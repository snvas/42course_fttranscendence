<script lang="ts">
	import authService from "../api/AuthService"

	let logoutResponse = JSON.stringify({})
	let sessionResponse = JSON.stringify({})

	const handleSessionRequest = async(): Promise<void> => {
			const response = await authService.validateUserSession();
			sessionResponse = JSON.stringify(response.data);
	}
	const handleLogout = async (): Promise<void>  => {
		const response = await authService.logoutUser();
		logoutResponse = JSON.stringify(response.data);
	}

</script>
<style lang="postcss">
	button {
		border: 1px solid black;
	}
</style>

<div>
	<h1>OAuth2 and 2FA</h1>
	<br>
	<hr>
	<br>
	<a href="http://localhost:3000/api/auth/42/login">Login with OAuth2</a>
	<br>
	<br>
	<button on:click={handleLogout}>Logout</button>
	{logoutResponse}
</div>
<br>
<hr>
<br>
<div>
	<button on:click={handleSessionRequest}>Get Session</button>
	{sessionResponse}
</div>