import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SyncStatus from '../Common/SyncStatus';
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

      case 'changeAdminCredentials':
        // Alterar credenciais do admin
        const adminUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedAdmins = adminUsers.map(u => 
          u.role === 'admin' ? 
          { ...u, name: formData.name || u.name, username: formData.username || u.username, password: formData.password || u.password } : 
          u
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedAdmins));
        alert('Credenciais administrativas atualizadas com sucesso!');
        break;

      case 'addService':
        // Adicionar novo serviço
        const services = JSON.parse(localStorage.getItem('services') || '[]');
        const newService = {
          id: Date.now(),
          name: formData.serviceName,
          description: formData.description,
          price: parseFloat(formData.price),
          duration: formData.duration,
          image: formData.emoji || '💅'
        };
        const updatedServices = [...services, newService];
        localStorage.setItem('services', JSON.stringify(updatedServices));
        alert('Serviço adicionado com sucesso!');
        break;

      case 'createBooking':
        // Criar novo agendamento (implementação básica)
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const newBooking = {
          id: Date.now().toString(),
          userId: formData.clientId,
          serviceId: formData.serviceId,
          date: formData.date,
          time: formData.time,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        };
        const updatedBookings = [...bookings, newBooking];
        localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        alert('Agendamento criado com sucesso!');
        break;
    }

    closeModal();
    // Forçar recarregamento dos dados
    window.dispatchEvent(new Event('dataSync'));
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
                padding: '20px',
                opacity: '0.2'
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
                        <h4 style={{ margin: '0 0 15px 0', color: '#FFD700', fontSize: '1rem', textAlign: 'center' }}>
                          🎛️ PAINEL ADMINISTRATIVO
                        </h4>
                      </div>

                      {/* Seção Visão Geral */}
                      <button
                        onClick={() => {
                          window.location.hash = 'admin-overview';
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '15px',
                          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                          border: 'none',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          color: '#000',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          marginBottom: '10px',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        📊 VISÃO GERAL
                      </button>

                      {/* Seção Gerenciar Serviços */}
                      <div style={{
                        background: 'rgba(76, 175, 80, 0.1)',
                        border: '2px solid #4CAF50',
                        borderRadius: '12px',
                        padding: '15px',
                        marginBottom: '15px'
                      }}>
                        <h5 style={{ 
                          margin: '0 0 12px 0', 
                          color: '#4CAF50', 
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}>
                          💅 GERENCIAR SERVIÇOS
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => {
                              openModal('addService');
                              setShowHamburgerMenu(false);
                            }}
                            style={{
                              padding: '10px',
                              background: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}
                          >
                            ➕ Adicionar Serviço
                          </button>
                          <button
                            onClick={() => {
                              window.location.hash = 'admin-services';
                              setShowHamburgerMenu(false);
                            }}
                            style={{
                              padding: '10px',
                              background: 'transparent',
                              color: '#4CAF50',
                              border: '1px solid #4CAF50',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}
                          >
                            ✏️ Editar Serviços
                          </button>
                        </div>
                      </div>

                      {/* Seção Agendamentos */}
                      <div style={{
                        background: 'rgba(33, 150, 243, 0.1)',
                        border: '2px solid #2196F3',
                        borderRadius: '12px',
                        padding: '15px',
                        marginBottom: '15px'
                      }}>
                        <h5 style={{ 
                          margin: '0 0 12px 0', 
                          color: '#2196F3', 
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}>
                          📅 AGENDAMENTOS
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => {
                              openModal('createBooking');
                              setShowHamburgerMenu(false);
                            }}
                            style={{
                              padding: '10px',
                              background: '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}
                          >
                            📅 Criar Agendamento
                          </button>
                          <button
                            onClick={() => {
                              window.location.hash = 'admin-bookings';
                              setShowHamburgerMenu(false);
                            }}
                            style={{
                              padding: '10px',
                              background: 'transparent',
                              color: '#2196F3',
                              border: '1px solid #2196F3',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}
                          >
                            📋 Gerenciar Agendamentos
                          </button>
                        </div>
                      </div>

                      {/* Seção Clientes */}
                      <button
                        onClick={() => {
                          console.log('📋 Abrindo gerenciamento de clientes...');
                          window.location.hash = 'admin-clients';
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'transparent',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Clientes
                      </button>

                      {/* Seção Automação */}
                      <button
                        onClick={() => {
                          window.location.hash = 'admin-automation';
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '15px',
                          background: 'rgba(255, 87, 34, 0.1)',
                          border: '2px solid #FF5722',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          color: '#FF5722',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          marginBottom: '15px',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        🤖 AUTOMAÇÃO N8N
                      </button>

                      {/* Seção Configurações Rápidas */}
                      <div style={{
                        background: 'rgba(255, 215, 0, 0.1)',
                        border: '2px solid #FFD700',
                        borderRadius: '12px',
                        padding: '15px',
                        marginBottom: '15px'
                      }}>
                        <h5 style={{ 
                          margin: '0 0 12px 0', 
                          color: '#FFD700', 
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}>
                          ⚙️ CONFIGURAÇÕES RÁPIDAS
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => {
                              openModal('changeAdminCredentials');
                              setShowHamburgerMenu(false);
                            }}
                            style={{
                              padding: '10px',
                              background: '#FFD700',
                              color: '#000',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}
                          >
                            🔐 Credenciais Admin
                          </button>
                          <div>
                            <label 
                              htmlFor="adminPhotoUploadMenu"
                              style={{
                                display: 'block',
                                padding: '10px',
                                background: 'transparent',
                                color: '#FFD700',
                                border: '1px solid #FFD700',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                textAlign: 'center'
                              }}
                            >
                              📸 Alterar Foto Admin
                            </label>
                            <input
                              id="adminPhotoUploadMenu"
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              style={{ display: 'none' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sincronização */}
                      <button
                        onClick={() => {
                          console.log('🔄 Sincronização forçada do menu admin...');
                          window.dispatchEvent(new Event('dataSync'));
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'linear-gradient(135deg, #00BCD4, #0097A7)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: 'white',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          marginBottom: '10px'
                        }}
                      >
                        🔄 SINCRONIZAR DADOS
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

            {/* Modais Administrativos */}
            {showModal === 'changeAdminCredentials' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>🔐 Alterar Credenciais Admin</h2>
                <input
                  type="text"
                  placeholder="Novo nome do administrador"
                  value={formData.name || ''}
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
                  type="text"
                  placeholder="Novo usuário"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
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
                  placeholder="Nova senha"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                    background: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
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

            {showModal === 'addService' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>➕ Adicionar Novo Serviço</h2>
                <input
                  type="text"
                  placeholder="Nome do serviço"
                  value={formData.serviceName || ''}
                  onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                />
                <textarea
                  placeholder="Descrição do serviço"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço (R$)"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
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
                  type="text"
                  placeholder="Duração (ex: 60 min)"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="💅"
                    value={formData.emoji || ''}
                    onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                    style={{
                      width: '80px',
                      padding: '12px',
                      border: '1px solid #000',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '1.5rem'
                    }}
                    maxLength="2"
                  />
                  <div style={{ flex: 1 }}>
                    <small style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>
                      Emoji do Serviço
                    </small>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {['💅', '🦶', '✨', '🎨', '💎', '🌟', '💆', '🌺'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({...formData, emoji})}
                          style={{
                            background: formData.emoji === emoji ? '#000' : 'transparent',
                            color: formData.emoji === emoji ? '#FFF' : '#000',
                            border: '1px solid #000',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    padding: '12px 20px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    Adicionar
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

            {showModal === 'createBooking' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>📅 Criar Novo Agendamento</h2>
                <select
                  value={formData.clientId || ''}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                >
                  <option value="">Selecionar cliente</option>
                  {/* Aqui seria necessário ter acesso aos clientes - implementação básica */}
                </select>
                <select
                  value={formData.serviceId || ''}
                  onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                >
                  <option value="">Selecionar serviço</option>
                  {/* Aqui seria necessário ter acesso aos serviços - implementação básica */}
                </select>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
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
                  type="time"
                  value={formData.time || ''}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
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
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    Criar
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