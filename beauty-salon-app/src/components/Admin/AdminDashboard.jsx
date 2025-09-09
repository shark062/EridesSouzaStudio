import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';
import '../Layout/Layout.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
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

  return (
    <div className="dashboard-container">
      <div style={{ 
        background: 'linear-gradient(135deg, #FFD700, #FFF8DC)',
        color: '#000',
        padding: '25px',
        borderRadius: '16px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>
          👑 Painel Administrativo - {user.name}
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem' }}>
          Gestão completa do Salon Beleza Dourada
        </p>
      </div>

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
        {['overview', 'bookings', 'clients', 'reports'].map(tab => (
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
    </div>
  );
};

export default AdminDashboard;