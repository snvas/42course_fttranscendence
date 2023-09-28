<script lang="ts">
	import type { AxiosResponse } from "axios";
	import type { FortyTwoUserDto } from "../../../backend/src/user/models/forty-two-user.dto";
	import {authService} from "$lib/api"
	import Button from "$lib/components/Button.svelte";

	let logoutResponse = JSON.stringify({})
	let sessionResponse = JSON.stringify({})

	const handleLogout = async (): Promise<void>  => {
		const response = await authService.logoutUser();
		logoutResponse = JSON.stringify(response.data);
	}

	const handleSessionRequest = async(): Promise<void> => {
		try {
			const response: AxiosResponse<FortyTwoUserDto> = await authService.validateUserSession();
			sessionResponse = JSON.stringify(response.data);
		} catch (error) {
			sessionResponse = error as string;
		}
	}
</script>

<style lang="postcss">
	button {
		border: 1px solid black;
	}
	button:hover {
		background-color: cadetblue;
	}
  a {
    color: black;
    text-decoration: none;
  }
</style>

<h1>OAuth2 and 2FA</h1>
<br>
<hr>
<br>

<Button tipo="stats" />
<Button tipo="history"/>
<Button tipo="settings"/>
<Button tipo="play"/>
<button>
  <a href="http://localhost:3000/api/auth/42/login">Login with OAuth2</a>
</button>
<br>
<br>
<button on:click={handleLogout}>Logout</button>
{logoutResponse}
<br>
<br>
<hr>
<br>
<button on:click={handleSessionRequest}>Get Session</button>
{sessionResponse}
