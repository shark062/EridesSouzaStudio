
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getButtonStyle } from '../../utils/theme';
import './Layout.css';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);

  const toggleHamburgerMenu = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
  };

  const openModal = (type) => {
    setShowModal(type);
    setShowHamburgerMenu(false);
    setFormData({});
  };

  const closeModal = () => {
    setShowModal(null);
    setFormData({});
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = e.target.result;
        setProfilePhoto(photoData);
        
        // Atualizar no localStorage
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedUsers = users.map(u => 
          u.id === user.id ? { ...u, profilePhoto: photoData } : u
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        
        // Atualizar usuário atual
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
          currentUser.profilePhoto = photoData;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
        
        alert('Foto de perfil atualizada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    switch(showModal) {
      case 'changePassword':
        // Alterar senha do usuário atual
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedUsers = users.map(u => 
          u.id === user.id ? { ...u, password: formData.newPassword } : u
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        alert('Senha alterada com sucesso!');
        break;
        
      case 'editProfile':
        // Editar dados do perfil
        const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedProfile = allUsers.map(u => 
          u.id === user.id ? { ...u, name: formData.name || u.name, email: formData.email || u.email, phone: formData.phone || u.phone } : u
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedProfile));
        
        // Atualizar usuário atual
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
          currentUser.name = formData.name || currentUser.name;
          currentUser.email = formData.email || currentUser.email;
          currentUser.phone = formData.phone || currentUser.phone;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
        alert('Perfil atualizado com sucesso!');
        break;
    }
    
    closeModal();
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {profilePhoto && (
                <img 
                  src={profilePhoto} 
                  alt="Perfil" 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #FFD700'
                  }}
                />
              )}
              <div>
                <span className="welcome-text">Olá, {user.name}!</span>
                <span className="user-role">{isAdmin ? 'Administrador' : 'Cliente'}</span>
              </div>
            </div>
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
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                minWidth: '280px',
                borderRadius: '12px',
                boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                zIndex: 1000,
                padding: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#FFD700', borderBottom: '1px solid #FFD700', paddingBottom: '10px' }}>
                    ⚙️ Menu de Opções
                  </h3>
                  
                  {/* Upload de Foto */}
                  <div>
                    <label 
                      htmlFor="photoUpload"
                      style={{
                        display: 'block',
                        padding: '12px',
                        background: 'transparent',
                        border: '1px solid #FFD700',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      📸 Alterar Foto de Perfil
                    </label>
                    <input
                      id="photoUpload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                  
                  <button
                    onClick={() => openModal('editProfile')}
                    style={{
                      padding: '12px',
                      background: 'transparent',
                      border: '1px solid #FFD700',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    👤 Editar Meus Dados
                  </button>
                  
                  <button
                    onClick={() => openModal('changePassword')}
                    style={{
                      padding: '12px',
                      background: 'transparent',
                      border: '1px solid #FFD700',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🔐 Alterar Senha
                  </button>
                  
                  {isAdmin && (
                    <>
                      <div style={{ borderTop: '1px solid #FFD700', marginTop: '10px', paddingTop: '10px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#FFD700', fontSize: '0.9rem' }}>
                          🛠️ Funções Administrativas
                        </h4>
                      </div>
                      
                      <button
                        onClick={() => window.location.href = '#admin-panel'}
                        style={{
                          padding: '12px',
                          background: '#FFD700',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: '#000',
                          textAlign: 'left',
                          fontWeight: 'bold'
                        }}
                      >
                        🎛️ Painel Administrativo Completo
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={logout}
                    style={{
                      padding: '12px',
                      background: '#FF4444',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      marginTop: '10px'
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
      
      {/* Modais */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: '#FFFFFF',
            padding: '30px',
            borderRadius: '16px',
            minWidth: '400px',
            maxWidth: '600px',
            color: '#000'
          }}>
            {showModal === 'changePassword' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>🔐 Alterar Senha</h2>
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={formData.newPassword || ''}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={formData.confirmPassword || ''}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '20px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    padding: '12px 20px',
                    background: '#000',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Salvar
                  </button>
                  <button type="button" onClick={closeModal} style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    color: '#000',
                    border: '1px solid #000',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {showModal === 'editProfile' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>👤 Editar Meus Dados</h2>
                <input
                  type="text"
                  placeholder="Nome"
                  value={formData.name || user.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email || user.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={formData.phone || user.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '20px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    padding: '12px 20px',
                    background: '#000',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Salvar
                  </button>
                  <button type="button" onClick={closeModal} style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    color: '#000',
                    border: '1px solid #000',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
