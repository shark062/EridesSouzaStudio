import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getButtonStyle } from '../../utils/theme';
import './Layout.css';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  const toggleHamburgerMenu = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="brand-logo">
            <div className="logo-symbol" style={{
              background: '#FFFFFF',
              color: '#000000',
              border: '2px solid #000000'
            }}>
              <div className="pr-letters" style={{ color: '#000000' }}>ES</div>
            </div>
            <h1 className="logo-text">
              <span className="primary-text" style={{
                color: '#FFFFFF',
                textShadow: 'none'
              }}>ERIDES SOUZA</span>
              <span className="secondary-text" style={{
                color: '#FFFFFF',
                textShadow: 'none'
              }}>ESTÚDIO</span>
            </h1>
          </div>
          {isAdmin && <span className="admin-badge">ADMIN</span>}
        </div>
        
        <div className="user-section">
          <div className="user-info">
            <span className="welcome-text">Olá, {user.name}!</span>
            <span className="user-role">{isAdmin ? 'Administrador' : 'Cliente'}</span>
          </div>
          
          {/* Menu Hambúrguer */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={toggleHamburgerMenu}
              style={{
                cursor: 'pointer',
                padding: '10px',
                background: '#000',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                border: '2px solid #FFD700'
              }}
            >
              <div style={{ width: '25px', height: '3px', background: '#FFFFFF', borderRadius: '2px' }}></div>
              <div style={{ width: '25px', height: '3px', background: '#FFFFFF', borderRadius: '2px' }}></div>
              <div style={{ width: '25px', height: '3px', background: '#FFFFFF', borderRadius: '2px' }}></div>
            </div>
            
            {/* Menu Dropdown */}
            {showHamburgerMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '10px',
                background: '#FFFFFF',
                minWidth: '250px',
                borderRadius: '12px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                border: '2px solid #FFD700',
                zIndex: 1000,
                padding: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <button
                    style={{
                      padding: '12px',
                      background: 'transparent',
                      border: '1px solid #000',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#000',
                      textAlign: 'left'
                    }}
                  >
                    👤 Alterar Usuário e Senha
                  </button>
                  
                  <button
                    style={{
                      padding: '12px',
                      background: 'transparent',
                      border: '1px solid #000',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#000',
                      textAlign: 'left'
                    }}
                  >
                    📝 Corrigir Dados de Usuários
                  </button>
                  
                  <button
                    style={{
                      padding: '12px',
                      background: 'transparent',
                      border: '1px solid #000',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#000',
                      textAlign: 'left'
                    }}
                  >
                    📅 Gerenciar Agendamentos
                  </button>
                  
                  <button
                    onClick={logout}
                    style={{
                      padding: '12px',
                      background: '#FF4444',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      textAlign: 'left'
                    }}
                  >
                    🚪 Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;