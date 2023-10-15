import { render, cleanup } from '@testing-library/svelte';
import UsersList from '$lib/components/UsersList.svelte';

// Limpar após cada teste
afterEach(cleanup);

describe('User Component', () => {
  it('should render user information', () => {
    const { getByAltText, getByText } = render(UsersList, { users: [{ nickname: 'JohnDoe', avatar: 'some-avatar-path.jpg', status: 'online', friend: true, blocked: false }] });
    
    expect(getByAltText('JohnDoe')).toBeInTheDocument();
    expect(getByText('JohnDoe')).toBeInTheDocument();
    expect(getByText('online')).toBeInTheDocument();
  });

  it('should display Friend if user.friend is true', () => {
    const { getByText } = render(UsersList, { users: [{ nickname: 'JohnDoe', friend: true, blocked: false }] });

    expect(getByText('Friend')).toBeInTheDocument();
  });

  it('should not display Friend if user.friend is false', () => {
    const { queryByText } = render(UsersList, { users: [{ nickname: 'JohnDoe', friend: false, blocked: false }] });

    expect(queryByText('Friend')).not.toBeInTheDocument();
  });

  it('should display Blocked if user.blocked is true', () => {
    const { getByText } = render(UsersList, { users: [{ nickname: 'JohnDoe', friend: false, blocked: true }] });

    expect(getByText('Blocked')).toBeInTheDocument();
  });

  it('should not display Blocked if user.blocked is false', () => {
    const { queryByText } = render(UsersList, { users: [{ nickname: 'JohnDoe', friend: false, blocked: false }] });

    expect(queryByText('Blocked')).not.toBeInTheDocument();
  });
  
  // ... Outros testes específicos que você queira adicionar
});
