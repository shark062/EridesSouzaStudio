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
    const newState = !showHamburgerMenu;
    setShowHamburgerMenu(newState);
    
    // Disparar evento para outros componentes
    window.dispatchEvent(new CustomEvent('hamburgerMenuToggle', {
      detail: { isOpen: newState }
    }));
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
        // Verificar se as senhas coincidem
        if (formData.newPassword !== formData.confirmPassword) {
          alert('❌ As senhas não coincidem! Por favor, tente novamente.');
          return;
        }
        
        // Verificar se a senha tem pelo menos 6 caracteres
        if (formData.newPassword.length < 6) {
          alert('❌ A senha deve ter pelo menos 6 caracteres!');
          return;
        }
        
        // Alterar senha do usuário atual
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedUsers = users.map(u => 
          u.id === user.id ? { ...u, password: formData.newPassword } : u
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        alert('✅ Senha alterada com sucesso!');
        break;

      case 'editProfile':
        // Verificar se pelo menos um campo foi preenchido
        if (!formData.name && !formData.email && !formData.phone) {
          alert('❌ Por favor, preencha pelo menos um campo para atualizar!');
          return;
        }
        
        // Validar email se fornecido
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          alert('❌ Por favor, insira um email válido!');
          return;
        }
        
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
        alert('✅ Perfil atualizado com sucesso!');
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
        // Validar campos obrigatórios
        if (!formData.serviceName || !formData.price || !formData.duration) {
          alert('❌ Por favor, preencha todos os campos obrigatórios!');
          return;
        }
        
        // Validar preço
        if (parseFloat(formData.price) <= 0) {
          alert('❌ O preço deve ser maior que zero!');
          return;
        }
        
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
        alert('✅ Serviço adicionado com sucesso!');
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
              background: 'transparent',
              color: '#000000',
              border: '3px solid #000000',
              borderRadius: '8px',
              width: '70px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div className="pr-letters" style={{ 
                color: '#000000', 
                fontSize: '2rem',
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif'
              }}>ES</div>
            </div>
            <h1 className="logo-text">
              <span className="primary-text" style={{
                color: '#000000',
                textShadow: 'none',
                fontSize: '1.6rem',
                fontWeight: 'bold',
                letterSpacing: '3px'
              }}>ERIDES SOUZA</span>
              <span className="secondary-text" style={{
                color: '#000000',
                textShadow: 'none',
                fontSize: '1.1rem',
                fontWeight: '500',
                letterSpacing: '5px',
                marginTop: '-5px'
              }}>ESTÚDIO</span>
            </h1>
          </div>
          {isAdmin && <span className="admin-badge" style={{
            background: '#000000',
            color: '#FFFFFF',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            border: '2px solid #000000'
          }}>ADMIN</span>}
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
                background: '#000000',
                minWidth: '300px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                border: '2px solid #FFD700',
                zIndex: 1000,
                padding: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#FFD700', textAlign: 'center', fontSize: '1.1rem' }}>
                    Menu de Opções
                  </h3>

                  {/* Upload de Foto */}
                  <div>
                    <label 
                      htmlFor="photoUpload"
                      style={{
                        display: 'block',
                        padding: '10px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#FFFFFF',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      Alterar Foto de Perfil
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
                      width: '100%',
                      padding: '10px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    Editar Meus Dados
                  </button>

                  <button
                    onClick={() => openModal('changePassword')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    Alterar Senha
                  </button>

                  {/* Seção de Navegação Principal */}
                  {!isAdmin && (
                    <>
                      <div style={{ borderTop: '1px solid rgba(255, 215, 0, 0.3)', marginTop: '15px', paddingTop: '15px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#FFD700', fontSize: '0.9rem', textAlign: 'center' }}>
                          Navegação Principal
                        </h4>
                      </div>

                      <button
                        onClick={() => {
                          // Disparar evento específico para mudança de aba
                          const event = new CustomEvent('tabChange', { 
                            detail: { tab: 'services' }
                          });
                          window.dispatchEvent(event);
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        💅 Serviços
                      </button>

                      <button
                        onClick={() => {
                          const event = new CustomEvent('tabChange', { 
                            detail: { tab: 'bookings' }
                          });
                          window.dispatchEvent(event);
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        📅 Agendamentos
                      </button>

                      <button
                        onClick={() => {
                          const event = new CustomEvent('tabChange', { 
                            detail: { tab: 'schedule' }
                          });
                          window.dispatchEvent(event);
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        ⏰ Agendar
                      </button>

                      <button
                        onClick={() => {
                          const event = new CustomEvent('tabChange', { 
                            detail: { tab: 'history' }
                          });
                          window.dispatchEvent(event);
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        📋 Histórico
                      </button>

                      <button
                        onClick={() => {
                          const event = new CustomEvent('tabChange', { 
                            detail: { tab: 'loyalty' }
                          });
                          window.dispatchEvent(event);
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease',
                          marginBottom: '15px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        🏆 Fidelidade
                      </button>
                    </>
                  )}

                  {/* Notificações */}
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('toggleNotifications'));
                      setShowHamburgerMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    🔔 Notificações
                  </button>

                  {/* Suporte */}
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('toggleChat'));
                      setShowHamburgerMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    💬 Suporte
                  </button>

                  {isAdmin && (
                    <>
                      <div style={{ borderTop: '1px solid rgba(255, 215, 0, 0.3)', marginTop: '15px', paddingTop: '15px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#FFD700', fontSize: '0.9rem', textAlign: 'center' }}>
                          Painel Administrativo
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
                          padding: '10px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Visão Geral
                      </button>

                      {/* Gerenciar Serviços */}
                      <button
                        onClick={() => {
                          openModal('addService');
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Adicionar Serviço
                      </button>

                      <button
                        onClick={() => {
                          window.location.hash = 'admin-services';
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Editar Serviços
                      </button>

                      {/* Agendamentos */}
                      <button
                        onClick={() => {
                          openModal('createBooking');
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Criar Agendamento
                      </button>

                      <button
                        onClick={() => {
                          window.location.hash = 'admin-bookings';
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Gerenciar Agendamentos
                      </button>

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

                      {/* Automação */}
                      <button
                        onClick={() => {
                          window.location.hash = 'admin-automation';
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Automação N8N
                      </button>

                      {/* Configurações */}
                      <button
                        onClick={() => {
                          openModal('changeAdminCredentials');
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Credenciais Admin
                      </button>

                      {/* Sincronização */}
                      <button
                        onClick={() => {
                          console.log('🔄 Sincronização forçada do menu admin...');
                          window.dispatchEvent(new Event('dataSync'));
                          setShowHamburgerMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease',
                          marginBottom: '10px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Sincronizar Dados
                      </button>
                    </>
                  )}

                  <button
                    onClick={logout}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'transparent',
                      border: 'none',
                      borderTop: '1px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: '0',
                      cursor: 'pointer',
                      color: '#FF4444',
                      textAlign: 'left',
                      marginTop: '15px',
                      paddingTop: '15px',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    Sair
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