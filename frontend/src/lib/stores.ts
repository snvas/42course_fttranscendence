import { type Readable, readable, writable } from 'svelte/store';
import type {
	PlayerStatusDto,
	FortyTwoUserDto,
	MessageProfileDto,
	ProfileDTO,
	GroupChatDto,
	SimpleProfileDto,
	DashboardUsersList,
	MatchEventDto
} from './dtos';
import { authService } from './api';
import type { Socket } from 'socket.io-client';
import { chatService } from '$lib/api/services';
import { verifyUnautorized } from '$lib/utils';
import { AxiosError } from 'axios';


type AuthState = {
	loading: boolean;
	session: FortyTwoUserDto | null;
	uniqueSession?: boolean;
};

let authState: AuthState = {
	loading: false,
	session: null,
	uniqueSession: false
};

// ??? como fazer a requisição se repetir e manter o
export function useSession(): Readable<AuthState> {
	const auth = readable<AuthState>(authState, (set) => {
		set({
			loading: true,
			session: authState.session,
			uniqueSession: authState.uniqueSession,
		});
		authService
			.validateUniqueUserSession()
			.then((session) => {
				authState = {
					loading: false,
					session: session.data,
					uniqueSession: true
				};
				set(authState);
			})
			.catch((error) =>{
				verifyUnautorized(error);
				if (error instanceof AxiosError) {
					if (error.response?.status == 406) {
						authState = {
							loading: false,
							session: null,
							uniqueSession: false,
						};
						set(authState);
					}
				}
			});
		});
	return auth;
}


export function useAuth(): Readable<AuthState> {
	const auth = readable<AuthState>(authState, (set) => {
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

export const socket = writable<Socket>(chatService.getSocket());

export const selectedDirect = writable<MessageProfileDto | null>();

export const profile = writable<ProfileDTO>();

export const onlineUsers = writable<PlayerStatusDto[]>([]);

export const allUsers = writable<ProfileDTO[]>([]);

export const playersStatus = writable<DashboardUsersList[]>([]);

export const selectedGroup = writable<GroupChatDto | null>();

export const friendsList = writable<SimpleProfileDto[]>([]);
export const blockList = writable<SimpleProfileDto[]>([]);
export const blockedByList = writable<SimpleProfileDto[]>([]);

export const match = writable<MatchEventDto | null>(null);
