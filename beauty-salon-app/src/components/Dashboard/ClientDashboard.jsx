import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';
import ServiceCard from '../Services/ServiceCard';
import BookingForm from '../Booking/BookingForm';
import RatingSystem from '../Rating/RatingSystem';
import LoyaltySystem from '../Loyalty/LoyaltySystem';
import '../Layout/Layout.css';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('services');
  const [userBookings, setUserBookings] = useState([]);
  const [userStats, setUserStats] = useState({
    totalVisits: 0,
    loyaltyPoints: 0,
    nextReward: 100,
    lastVisit: null
  });

  const services = [
    {
      id: 1,
      name: 'Manicure Clássica',
      description: 'Cuidado completo das unhas das mãos',
      price: 25.00,
      duration: '45 min',
      image: '💅',
      category: 'manicure'
    },
    {
      id: 2,
      name: 'Pedicure Spa',
      description: 'Tratamento relaxante para os pés',
      price: 35.00,
      duration: '60 min',
      image: '🦶',
      category: 'pedicure'
    },
    {
      id: 3,
      name: 'Manicure + Pedicure',
      description: 'Pacote completo com desconto especial',
      price: 50.00,
      duration: '90 min',
      image: '✨',
      category: 'combo',
      originalPrice: 60.00
    },
    {
      id: 4,
      name: 'Unha Decorada',
      description: 'Arte personalizada nas unhas',
      price: 15.00,
      duration: '30 min',
      image: '🎨',
      category: 'decoracao'
    },
    {
      id: 5,
      name: 'Alongamento',
      description: 'Alongamento de unhas profissional',
      price: 45.00,
      duration: '90 min',
      image: '💎',
      category: 'alongamento'
    },
    {
      id: 6,
      name: 'Spa dos Pés Completo',
      description: 'Hidratação e esfoliação profunda',
      price: 55.00,
      duration: '75 min',
      image: '🧖‍♀️',
      category: 'spa'
    }
  ];

  useEffect(() => {
    // Carregar agendamentos do usuário
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const userBookings = bookings.filter(booking => booking.userId === user.id);
    setUserBookings(userBookings);

    // Carregar estatísticas do usuário
    const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
    if (stats[user.id]) {
      setUserStats(stats[user.id]);
    }
  }, [user.id]);

  const getUpcomingBookings = () => {
    const now = new Date();
    return userBookings
      .filter(booking => new Date(booking.date + 'T' + booking.time) > now)
      .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
      .slice(0, 3);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeStr) => {
    return timeStr;
  };

  const checkBirthday = () => {
    const today = new Date();
    const birthDate = new Date(user.birthDate || '2000-01-01');
    return today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate();
  };

  const isBirthday = checkBirthday();

  return (
    <div className="dashboard-container">
      {isBirthday && (
        <div className="birthday-banner" style={{
          background: 'linear-gradient(135deg, #FFD700, #FFF8DC)',
          color: '#000',
          padding: '20px',
          borderRadius: '16px',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          🎉 Feliz Aniversário, {user.name}! 🎂 Você tem desconto especial hoje! 🎁
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{userStats.totalVisits}</span>
          <span className="stat-label">Visitas Totais</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{userStats.loyaltyPoints}</span>
          <span className="stat-label">Pontos de Fidelidade</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{userStats.nextReward - userStats.loyaltyPoints}</span>
          <span className="stat-label">Para Próximo Prêmio</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{getUpcomingBookings().length}</span>
          <span className="stat-label">Próximos Agendamentos</span>
        </div>
      </div>

      <div className="tab-navigation" style={{ marginBottom: '30px' }}>
        {['services', 'bookings', 'schedule', 'loyalty'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...getButtonStyle(activeTab === tab ? 'primary' : 'secondary'),
              marginRight: '10px',
              fontSize: '0.9rem'
            }}
          >
            {tab === 'services' && '💅 Serviços'}
            {tab === 'bookings' && '📅 Meus Agendamentos'}
            {tab === 'schedule' && '⏰ Agendar'}
            {tab === 'loyalty' && '🏆 Fidelidade'}
          </button>
        ))}
      </div>

      {activeTab === 'services' && (
        <div>
          <h2 style={{ color: '#FFD700', marginBottom: '25px', textAlign: 'center' }}>
            ✨ Nossos Serviços
          </h2>
          <div className="dashboard-grid">
            {services.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service}
                isBirthday={isBirthday}
                onBook={() => setActiveTab('schedule')}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <h2 style={{ color: '#FFD700', marginBottom: '25px', textAlign: 'center' }}>
            📅 Meus Agendamentos
          </h2>
          <div className="dashboard-grid">
            {getUpcomingBookings().length > 0 ? (
              getUpcomingBookings().map(booking => (
                <div key={booking.id} className="dashboard-card">
                  <div className="card-header">
                    <span className="card-icon">📅</span>
                    <h3 className="card-title">{booking.serviceName}</h3>
                  </div>
                  <div className="card-content">
                    <p><strong>Data:</strong> {formatDate(booking.date)}</p>
                    <p><strong>Horário:</strong> {formatTime(booking.time)}</p>
                    <p><strong>Duração:</strong> {booking.duration}</p>
                    <p><strong>Valor:</strong> R$ {booking.price.toFixed(2)}</p>
                    <p><strong>Status:</strong> 
                      <span style={{ 
                        color: booking.status === 'confirmed' ? '#4CAF50' : '#FF9800',
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {booking.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </p>
                    
                    {/* Sistema de Avaliação para agendamentos passados */}
                    {new Date(booking.date + 'T' + booking.time) < new Date() && booking.status === 'confirmed' && (
                      <RatingSystem 
                        bookingId={booking.id}
                        serviceName={booking.serviceName}
                        onRatingSubmit={() => {
                          // Atualizar pontos de fidelidade
                          const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
                          if (!stats[user.id]) stats[user.id] = { loyaltyPoints: 0 };
                          stats[user.id].loyaltyPoints += 5; // Bônus por avaliar
                          localStorage.setItem('userStats', JSON.stringify(stats));
                        }}
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard-card">
                <div className="card-content" style={{ textAlign: 'center' }}>
                  <h3>Nenhum agendamento próximo</h3>
                  <p>Que tal agendar um serviço?</p>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    style={getButtonStyle('primary')}
                  >
                    Agendar Agora
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div>
          <h2 style={{ color: '#FFD700', marginBottom: '25px', textAlign: 'center' }}>
            ⏰ Agendar Serviço
          </h2>
          <BookingForm 
            services={services}
            user={user}
            isBirthday={isBirthday}
            onBookingComplete={() => {
              setActiveTab('bookings');
              // Recarregar agendamentos
              const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
              const userBookings = bookings.filter(booking => booking.userId === user.id);
              setUserBookings(userBookings);
            }}
          />
        </div>
      )}

      {activeTab === 'loyalty' && (
        <div>
          <h2 style={{ color: '#FFD700', marginBottom: '25px', textAlign: 'center' }}>
            🏆 Programa de Fidelidade
          </h2>
          <LoyaltySystem />
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;