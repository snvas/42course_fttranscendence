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
