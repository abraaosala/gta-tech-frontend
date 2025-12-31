import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../context/AuthContext';

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    
    <button onClick={handleLogout}>
      Sair
    </button>
  );
}
