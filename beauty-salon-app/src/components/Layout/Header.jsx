import { useAuth } from '../../contexts/AuthContext';
import { theme, getButtonStyle } from '../../utils/theme';
import './Layout.css';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="logo">✨ Salon Beleza Dourada</h1>
          {isAdmin && <span className="admin-badge">ADMIN</span>}
        </div>
        
        <div className="user-section">
          <div className="user-info">
            <span className="welcome-text">Olá, {user.name}!</span>
            <span className="user-role">{isAdmin ? 'Administrador' : 'Cliente'}</span>
          </div>
          
          <button
            onClick={logout}
            className="logout-button"
            style={getButtonStyle('secondary')}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;