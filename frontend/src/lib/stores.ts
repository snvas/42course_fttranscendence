import { browser } from '$app/environment';
import { type Readable, readable } from 'svelte/store';
import type { FortyTwoUserDto } from './dtos';
import { authService } from './api';

type AuthState = {
	loading: boolean;
	loggedIn: boolean;
	session?: FortyTwoUserDto;
};

let authState: AuthState = {
	loading: false,
	loggedIn: false
};
// ??? como fazer a requisição se repetir e manter o 
export let auth = readable(
	{
		loading: false,
		loggedIn: false
	},
	(set) => {
		set({
			loading: true,
			loggedIn: authState.loggedIn
		});
		authService
			.validateUserSession()
			.then((session) => {
				authState = {
					loading: false,
					loggedIn: true,
					session: session.data
				};
				set(authState);
			})
			.catch(() => {
				authState = {
					loading: false,
					loggedIn: false
				};
				set(authState);
			});
	},
);
