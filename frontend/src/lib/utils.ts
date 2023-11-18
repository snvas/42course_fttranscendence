import { goto } from '$app/navigation';
import { isAxiosError } from 'axios';

export function validateNicknameInput(nickname: string): true | string {
	const maxLength = 12;
	const minLength = 3;

	if (nickname.length < minLength) {
		return `nickname must have at least ${minLength} characters`;
	}

	if (nickname.includes(' ')) {
		return 'nickname must not have blank spaces';
	}

	if (nickname.length > maxLength) {
		return `nickname is too long, maximum size is ${maxLength} characters`;
	}

	return true;
}

export function validateGroupName(groupName: string): true | string {
	const maxLength = 40;
	const minLength = 3;

	if (groupName.length < minLength) {
		return `group name must have at least ${minLength} characters`;
	}

	if (groupName.length > maxLength) {
		return `group name is too long, maximum size is ${maxLength} characters`;
	}

	return true;
}

export function validateMessage(message: string): true | string {
	const maxLength = 200;

	if (message.length > maxLength) {
		return `message is too long, maximum size is ${maxLength} characters`;
	}

	return true;
}

export function verifyUnautorized(error: any | number): boolean {
	let errorCode: number = 0;
	if (isAxiosError(error) && error.response) {
		errorCode = error.response.status;
	} else if (typeof error === 'number') {
		errorCode = error;
	}

	if (errorCode == 403) {
		goto('/login');
		return true;
	}
	return false;
}
