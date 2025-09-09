import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';
import AutomationPanel from './AutomationPanel';
import n8nService from '../../services/n8nService';
import '../Layout/Layout.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({
    todayBookings: 0,
    todayRevenue: 0,
    monthBookings: 0,
    monthRevenue: 0,
    yearRevenue: 0,
    totalClients: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Carregar agendamentos
    const allBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    setBookings(allBookings);

    // Carregar clientes
    const allClients = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    setClients(allClients);

    // Calcular estatísticas
    calculateStats(allBookings, allClients);
  };

  const calculateStats = (bookings, clients) => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const todayStr = today.toISOString().split('T')[0];

    const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled');
    const monthBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate.getMonth() === thisMonth && 
             bookingDate.getFullYear() === thisYear &&
             b.status !== 'cancelled';
    });
    const yearBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate.getFullYear() === thisYear && b.status !== 'cancelled';
    });

    setStats({
      todayBookings: todayBookings.length,
      todayRevenue: todayBookings.reduce((sum, b) => sum + b.price, 0),
      monthBookings: monthBookings.length,
      monthRevenue: monthBookings.reduce((sum, b) => sum + b.price, 0),
      yearRevenue: yearBookings.reduce((sum, b) => sum + b.price, 0),
      totalClients: clients.length
    });
  };

  const getRecentBookings = () => {
    return bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  };

  const getTopClients = () => {
    const clientStats = {};
    
    bookings.forEach(booking => {
      if (booking.status !== 'cancelled') {
        if (!clientStats[booking.userId]) {
          const client = clients.find(c => c.id === booking.userId);
          clientStats[booking.userId] = {
            name: client?.name || 'Cliente não encontrado',
            visits: 0,
            totalSpent: 0
          };
        }
        clientStats[booking.userId].visits++;
        clientStats[booking.userId].totalSpent += booking.price;
      }
    });

    return Object.entries(clientStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    const updatedBookings = bookings.map(booking =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    );
    
    setBookings(updatedBookings);
    localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
    calculateStats(updatedBookings, clients);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: { background: '#4CAF50', color: 'white' },
      pending: { background: '#FF9800', color: 'white' },
      cancelled: { background: '#F44336', color: 'white' },
      completed: { background: '#2196F3', color: 'white' }
    };

    const labels = {
      confirmed: 'Confirmado',
      pending: 'Pendente',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };

    return (
      <span style={{
        ...styles[status],
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
      }}>
        {labels[status]}
      </span>
    );
  };

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    switch(showModal) {
      case 'changeAdminCredentials':
        // Atualizar credenciais do admin
        const adminUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedAdmins = adminUsers.map(user => 
          user.role === 'admin' ? 
          { ...user, name: formData.name || user.name, password: formData.password || user.password } : 
          user
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedAdmins));
        alert('Credenciais administrativas atualizadas com sucesso!');
        break;
        
      case 'editClientData':
        // Editar dados do cliente
        const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedUsers = allUsers.map(user => 
          user.id === formData.clientId ? { ...user, ...formData } : user
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        setClients(updatedUsers.filter(user => user.role !== 'admin'));
        alert('Dados do cliente atualizados com sucesso!');
        break;
        
      case 'manageBookings':
        // Gerenciar agendamentos
        const allBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const updatedBookings = allBookings.map(booking => 
          booking.id === formData.bookingId ? { ...booking, status: formData.status } : booking
        );
        localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        setBookings(updatedBookings);
        calculateStats(updatedBookings, clients);
        alert('Agendamento atualizado com sucesso!');
        break;
        
      case 'changeTheme':
        // Alterar tema para branco
        document.documentElement.style.setProperty('--primary-color', '#FFFFFF');
        document.documentElement.style.setProperty('--secondary-color', '#000000');
        localStorage.setItem('theme', 'white');
        alert('Tema alterado para branco com sucesso!');
        break;
    }
    
    closeModal();
  };

  return (
    <div className="dashboard-container">
      <div style={{ 
        background: 'linear-gradient(135deg, #FFFFFF, #F5F5F5)',
        color: '#000',
        padding: '25px',
        borderRadius: '16px',
        textAlign: 'center',
        marginBottom: '30px',
        position: 'relative'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>
          👑 Painel Administrativo - {user.name}
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem' }}>
          Gestão completa do Salon Beleza Dourada
        </p>
        
        {/* Menu Hambúrguer */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px'
        }}>
          <div 
            onClick={toggleHamburgerMenu}
            style={{
              cursor: 'pointer',
              padding: '10px',
              background: '#000',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
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
              background: '#FFFFFF',
              border: '2px solid #000',
              borderRadius: '12px',
              minWidth: '280px',
              padding: '20px',
              zIndex: 1000,
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#000', borderBottom: '1px solid #000', paddingBottom: '10px' }}>
                ⚙️ Configurações
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => openModal('changeAdminCredentials')}
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
                  🔐 Alterar Usuário e Senha Admin
                </button>
                
                <button
                  onClick={() => openModal('editClientData')}
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
                  👤 Corrigir Dados de Usuários
                </button>
                
                <button
                  onClick={() => openModal('manageBookings')}
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
                  onClick={() => openModal('changeTheme')}
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
                  🎨 Alterar Logo para Branco
                </button>
              </div>
            </div>
          )}
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

            {showModal === 'editClientData' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>👤 Editar Dados do Cliente</h2>
                <select
                  value={formData.clientId || ''}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                >
                  <option value="">Selecionar cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Novo nome"
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
                  type="email"
                  placeholder="Novo email"
                  value={formData.email || ''}
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
                  placeholder="Novo telefone"
                  value={formData.phone || ''}
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

            {showModal === 'manageBookings' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>📅 Gerenciar Agendamentos</h2>
                <select
                  value={formData.bookingId || ''}
                  onChange={(e) => setFormData({...formData, bookingId: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                >
                  <option value="">Selecionar agendamento</option>
                  {bookings.map(booking => (
                    <option key={booking.id} value={booking.id}>
                      {booking.serviceName} - {formatDate(booking.date)} {booking.time}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '20px',
                    border: '1px solid #000',
                    borderRadius: '8px'
                  }}
                >
                  <option value="">Novo status</option>
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    padding: '12px 20px',
                    background: '#000',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Atualizar
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

            {showModal === 'changeTheme' && (
              <div>
                <h2 style={{ marginBottom: '20px' }}>🎨 Alterar Tema</h2>
                <p style={{ marginBottom: '20px' }}>
                  Tem certeza que deseja alterar a logo e tema para branco?
                  Isso removerá o gradiente preto e dourado atual.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleFormSubmit} style={{
                    padding: '12px 20px',
                    background: '#000',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Confirmar
                  </button>
                  <button onClick={closeModal} style={{
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.todayBookings}</span>
          <span className="stat-label">Agendamentos Hoje</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatCurrency(stats.todayRevenue)}</span>
          <span className="stat-label">Faturamento Hoje</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.monthBookings}</span>
          <span className="stat-label">Agendamentos do Mês</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatCurrency(stats.monthRevenue)}</span>
          <span className="stat-label">Faturamento do Mês</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatCurrency(stats.yearRevenue)}</span>
          <span className="stat-label">Faturamento do Ano</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalClients}</span>
          <span className="stat-label">Total de Clientes</span>
        </div>
      </div>

      {/* Navegação por abas */}
      <div className="tab-navigation" style={{ marginBottom: '30px' }}>
        {['overview', 'bookings', 'clients', 'reports', 'automation'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...getButtonStyle(activeTab === tab ? 'primary' : 'secondary'),
              marginRight: '10px',
              fontSize: '0.9rem'
            }}
          >
            {tab === 'overview' && '📊 Visão Geral'}
            {tab === 'bookings' && '📅 Agendamentos'}
            {tab === 'clients' && '👥 Clientes'}
            {tab === 'reports' && '📈 Relatórios'}
            {tab === 'automation' && '🤖 Automação N8n'}
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      {activeTab === 'overview' && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <span className="card-icon">📅</span>
              <h3 className="card-title">Agendamentos Recentes</h3>
            </div>
            <div className="card-content">
              {getRecentBookings().slice(0, 5).map(booking => {
                const client = clients.find(c => c.id === booking.userId);
                return (
                  <div key={booking.id} style={{ 
                    padding: '10px 0', 
                    borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{client?.name || 'Cliente'}</strong><br />
                      <small>{booking.serviceName} - {formatDate(booking.date)} {booking.time}</small>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <span className="card-icon">🏆</span>
              <h3 className="card-title">Top 5 Clientes</h3>
            </div>
            <div className="card-content">
              {getTopClients().map((client, index) => (
                <div key={client.id} style={{ 
                  padding: '10px 0', 
                  borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ 
                      background: index < 3 ? '#FFD700' : 'rgba(255, 215, 0, 0.3)',
                      color: index < 3 ? '#000' : '#FFD700',
                      padding: '2px 6px',
                      borderRadius: '50%',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      marginRight: '10px'
                    }}>
                      {index + 1}
                    </span>
                    <strong>{client.name}</strong><br />
                    <small>{client.visits} visitas</small>
                  </div>
                  <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {formatCurrency(client.totalSpent)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <h2 style={{ color: '#FFD700', marginBottom: '25px', textAlign: 'center' }}>
            📅 Gestão de Agendamentos
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '12px',
              overflow: 'hidden',
              color: 'white'
            }}>
              <thead style={{ background: 'rgba(255, 215, 0, 0.2)' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Cliente</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Serviço</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Data/Hora</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Valor</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {getRecentBookings().map(booking => {
                  const client = clients.find(c => c.id === booking.userId);
                  return (
                    <tr key={booking.id} style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.1)' }}>
                      <td style={{ padding: '15px' }}>{client?.name || 'Cliente'}</td>
                      <td style={{ padding: '15px' }}>{booking.serviceName}</td>
                      <td style={{ padding: '15px' }}>
                        {formatDate(booking.date)}<br />
                        <small>{booking.time}</small>
                      </td>
                      <td style={{ padding: '15px' }}>{formatCurrency(booking.price)}</td>
                      <td style={{ padding: '15px' }}>{getStatusBadge(booking.status)}</td>
                      <td style={{ padding: '15px' }}>
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            borderRadius: '6px',
                            padding: '5px'
                          }}
                        >
                          <option value="pending">Pendente</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="completed">Concluído</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div>
          <h2 style={{ color: '#FFD700', marginBottom: '25px', textAlign: 'center' }}>
            👥 Gestão de Clientes
          </h2>
          <div className="dashboard-grid">
            {clients.map(client => (
              <div key={client.id} className="dashboard-card">
                <div className="card-header">
                  <span className="card-icon">👤</span>
                  <h3 className="card-title">{client.name}</h3>
                </div>
                <div className="card-content">
                  <p><strong>Email:</strong> {client.email}</p>
                  <p><strong>Telefone:</strong> {client.phone}</p>
                  <p><strong>Usuário:</strong> {client.username}</p>
                  {client.birthDate && (
                    <p><strong>Aniversário:</strong> {formatDate(client.birthDate)}</p>
                  )}
                  <p><strong>Cadastrado em:</strong> {formatDate(client.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          <h2 style={{ color: '#FFD700', marginBottom: '25px', textAlign: 'center' }}>
            📈 Relatórios e Análises
          </h2>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-header">
                <span className="card-icon">💰</span>
                <h3 className="card-title">Resumo Financeiro</h3>
              </div>
              <div className="card-content">
                <div style={{ marginBottom: '15px' }}>
                  <strong>Faturamento por Período:</strong>
                  <ul style={{ marginTop: '10px' }}>
                    <li>Hoje: {formatCurrency(stats.todayRevenue)}</li>
                    <li>Este Mês: {formatCurrency(stats.monthRevenue)}</li>
                    <li>Este Ano: {formatCurrency(stats.yearRevenue)}</li>
                  </ul>
                </div>
                <div>
                  <strong>Média por Atendimento:</strong> {formatCurrency(stats.monthBookings > 0 ? stats.monthRevenue / stats.monthBookings : 0)}
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <span className="card-icon">📊</span>
                <h3 className="card-title">Estatísticas de Atendimento</h3>
              </div>
              <div className="card-content">
                <div style={{ marginBottom: '15px' }}>
                  <strong>Agendamentos por Período:</strong>
                  <ul style={{ marginTop: '10px' }}>
                    <li>Hoje: {stats.todayBookings}</li>
                    <li>Este Mês: {stats.monthBookings}</li>
                    <li>Total de Clientes: {stats.totalClients}</li>
                  </ul>
                </div>
                <div>
                  <strong>Taxa de Ocupação Hoje:</strong> {((stats.todayBookings / 20) * 100).toFixed(1)}%
                  <br />
                  <small>(Baseado em 20 horários disponíveis por dia)</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'automation' && (
        <AutomationPanel />
      )}
    </div>
  );
};

export default AdminDashboard;