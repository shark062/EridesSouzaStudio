import { useAuth } from '../../contexts/AuthContext';
import { theme, getButtonStyle } from '../../utils/theme';
import './Layout.css';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="brand-logo">
            <div className="logo-symbol">
              <div className="pr-letters">PR</div>
            </div>
            <h1 className="logo-text">
              <span className="primary-text">ERIDES SOUZA</span>
              <span className="secondary-text">ESTÚDIO</span>
            </h1>
          </div>
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