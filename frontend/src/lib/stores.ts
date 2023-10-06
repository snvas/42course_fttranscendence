import { browser } from '$app/environment';
import { type Readable, readable } from 'svelte/store';
import type { FortyTwoUserDto } from './dtos';
import { authService } from './api';

type AuthState = {
	loading: boolean;
	session: FortyTwoUserDto | null;
};

let authState: AuthState = {
	loading: false,
	session: null
};

// ??? como fazer a requisição se repetir e manter o
export function useAuth(): Readable<AuthState> {
	let auth = readable<AuthState>(authState, (set) => {
		set({
			loading: true,
			session: authState.session
		});
		authService
			.validateUserSession()
			.then((session) => {
				authState = {
					loading: false,
					session: session.data
				};
				set(authState);
			})
			.catch(() => {
				authState = {
					loading: false,
					session: null
				};
				set(authState);
			});
	});
	return auth;
}
