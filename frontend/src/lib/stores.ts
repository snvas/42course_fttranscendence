import { type Readable, readable, writable } from 'svelte/store';
import type {
	PlayerStatusDto,
	FortyTwoUserDto,
	MessageProfileDto,
	ProfileDTO,
	GroupChatDto,
	SimpleProfileDto,
	DashboardUsersList
} from './dtos';
import { authService } from './api';
import type { Socket } from 'socket.io-client';
import { chatService } from '$lib/api/services';

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

export let socket = writable<Socket>(chatService.getSocket());

export let selectedDirect = writable<MessageProfileDto | null>();

export let profile = writable<ProfileDTO>();

export let onlineUsers = writable<PlayerStatusDto[]>([]);

export let allUsers = writable<ProfileDTO[]>([]);

export let playersStatus = writable<DashboardUsersList[]>([]);

export let selectedGroup = writable<GroupChatDto | null>();

export let friendsList = writable<SimpleProfileDto[]>([]);
