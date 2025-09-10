import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';
import ServiceCard from '../Services/ServiceCard';
import BookingForm from '../Booking/BookingForm';
import RatingSystem from '../Rating/RatingSystem';
import LoyaltySystem from '../Loyalty/LoyaltySystem';
import UserProfile from './UserProfile';
import n8nService from '../../services/n8nService';
import '../Layout/Layout.css';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('services');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
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

    // Carregar notificações
    loadNotifications();
    
    // Automação de aniversário N8n
    if (isBirthday) {
      n8nService.automate_birthdayReminder(user).then(result => {
        if (result.success) {
          console.log('🎉 Automação de aniversário ativada:', result);
        }
      }).catch(console.error);
    }
    
    // Carregar mensagens do chat
    const savedMessages = JSON.parse(localStorage.getItem(`chatMessages_${user.id}`) || '[]');
    setChatMessages(savedMessages);

    // Listener para detectar quando o menu hambúrguer é aberto/fechado
    const handleMenuToggle = (event) => {
      setShowHamburgerMenu(event.detail?.isOpen || false);
    };

    window.addEventListener('hamburgerMenuToggle', handleMenuToggle);

    return () => {
      window.removeEventListener('hamburgerMenuToggle', handleMenuToggle);
    };
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

  const loadNotifications = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const notifications = [];
    
    // Notificações de agendamentos próximos
    const upcomingBookings = getUpcomingBookings();
    upcomingBookings.forEach(booking => {
      const bookingDate = new Date(booking.date + 'T' + booking.time);
      const timeDiff = bookingDate - today;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff <= 24 && hoursDiff > 0) {
        notifications.push({
          id: `booking_${booking.id}`,
          type: 'reminder',
          title: 'Agendamento Próximo',
          message: `Você tem ${booking.serviceName} agendado para ${formatDate(booking.date)} às ${booking.time}`,
          time: new Date().toISOString(),
          read: false
        });
      }
    });
    
    // Notificação de aniversário
    if (isBirthday) {
      notifications.push({
        id: 'birthday',
        type: 'birthday',
        title: 'Feliz Aniversário! 🎉',
        message: 'Aproveite seu desconto especial de 10% em todos os serviços hoje!',
        time: new Date().toISOString(),
        read: false
      });
    }
    
    // Notificações de pontos de fidelidade
    if (userStats.loyaltyPoints >= userStats.nextReward) {
      notifications.push({
        id: 'loyalty_reward',
        type: 'reward',
        title: 'Parabéns! Você ganhou um prêmio! 🏆',
        message: 'Seus pontos de fidelidade garantem um desconto especial!',
        time: new Date().toISOString(),
        read: false
      });
    }
    
    setNotifications(notifications);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      time: new Date().toISOString(),
      status: 'sent'
    };
    
    const updatedMessages = [...chatMessages, message];
    setChatMessages(updatedMessages);
    localStorage.setItem(`chatMessages_${user.id}`, JSON.stringify(updatedMessages));
    setNewMessage('');
    
    // Integração N8n para resposta automática inteligente
    setTimeout(async () => {
      try {
        const aiResponse = await n8nService.sendChatMessage(newMessage, user.id, chatMessages);
        
        const autoReply = {
          id: Date.now() + 1,
          text: aiResponse.reply,
          sender: 'admin',
          time: new Date().toISOString(),
          status: 'received',
          isAI: !aiResponse.offline
        };
        
        const newMessages = [...updatedMessages, autoReply];
        setChatMessages(newMessages);
        localStorage.setItem(`chatMessages_${user.id}`, JSON.stringify(newMessages));
        
        // Executar ações sugeridas pela IA (se houver)
        if (aiResponse.actions && aiResponse.actions.length > 0) {
          // Processar ações automáticas como agendamento, cancelamento, etc.
          console.log('🤖 Ações sugeridas pela IA:', aiResponse.actions);
        }
      } catch (error) {
        console.error('Erro na resposta automática:', error);
        // Fallback para resposta padrão
        const autoReply = {
          id: Date.now() + 1,
          text: 'Obrigada pela sua mensagem! Nossa equipe responderá em breve. Para agendamentos urgentes, ligue (11) 99999-9999.',
          sender: 'admin',
          time: new Date().toISOString(),
          status: 'received'
        };
        
        const newMessages = [...updatedMessages, autoReply];
        setChatMessages(newMessages);
        localStorage.setItem(`chatMessages_${user.id}`, JSON.stringify(newMessages));
      }
    }, 1500);
  };

  const getServiceHistory = () => {
    const now = new Date();
    return userBookings
      .filter(booking => new Date(booking.date + 'T' + booking.time) < now && booking.status === 'completed')
      .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
  };

  return (
    <div className="dashboard-container" style={{
      filter: showHamburgerMenu ? 'blur(3px)' : 'none',
      opacity: showHamburgerMenu ? '0.3' : '1',
      transition: 'all 0.3s ease',
      pointerEvents: showHamburgerMenu ? 'none' : 'auto'
    }}>
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

      {/* Barra de Notificações e Chat */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 215, 0, 0.3)'
      }}>
        <h2 style={{ color: '#FFD700', margin: 0 }}>Olá, {user.name}! 👋</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Botão Editar Perfil */}
          <button
            onClick={() => setShowProfileModal(true)}
            style={{
              ...getButtonStyle('primary'),
              padding: '10px 15px',
              fontSize: '0.9rem'
            }}
          >
            👤 Editar Perfil
          </button>
          
          {/* Botão de Notificações */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              ...getButtonStyle('secondary'),
              position: 'relative',
              padding: '10px 15px'
            }}
          >
            🔔 Notificações
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#FF4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          
          {/* Botão do Chat */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            style={{
              ...getButtonStyle('secondary'),
              padding: '10px 15px'
            }}
          >
            💬 Suporte
          </button>
        </div>
      </div>

      {/* Painel de Notificações */}
      {showNotifications && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          border: '2px solid #FFD700',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '15px' }}>🔔 Suas Notificações</h3>
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div key={notification.id} style={{
                background: notification.read ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.2)',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: notification.read ? '1px solid rgba(255, 215, 0, 0.3)' : '2px solid #FFD700'
              }}>
                <h4 style={{ 
                  color: notification.type === 'birthday' ? '#FF69B4' : '#FFD700',
                  margin: '0 0 5px 0',
                  fontSize: '1rem'
                }}>
                  {notification.title}
                </h4>
                <p style={{ color: 'white', margin: '5px 0', fontSize: '0.9rem' }}>
                  {notification.message}
                </p>
                <small style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {new Date(notification.time).toLocaleString('pt-BR')}
                </small>
                {!notification.read && (
                  <button
                    onClick={() => markNotificationAsRead(notification.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#FFD700',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      marginLeft: '15px',
                      fontSize: '0.8rem'
                    }}
                  >
                    Marcar como lida
                  </button>
                )}
              </div>
            ))
          ) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
              Nenhuma notificação no momento
            </p>
          )}
        </div>
      )}

      {/* Chat de Suporte */}
      {chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '350px',
          height: '450px',
          background: 'rgba(0, 0, 0, 0.95)',
          border: '2px solid #FFD700',
          borderRadius: '16px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Cabeçalho do Chat */}
          <div style={{
            background: 'linear-gradient(135deg, #FFD700, #FFF8DC)',
            color: '#000',
            padding: '15px',
            borderRadius: '14px 14px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h4 style={{ margin: 0 }}>💬 Suporte - Erides Souza</h4>
            <button
              onClick={() => setChatOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#000'
              }}
            >
              ✕
            </button>
          </div>
          
          {/* Mensagens */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {chatMessages.length > 0 ? (
              chatMessages.map(message => (
                <div key={message.id} style={{
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}>
                  <div style={{
                    background: message.sender === 'user' 
                      ? 'linear-gradient(135deg, #FFD700, #FFF8DC)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: message.sender === 'user' ? '#000' : '#FFF',
                    padding: '10px 15px',
                    borderRadius: message.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '0.9rem'
                  }}>
                    {message.text}
                  </div>
                  <small style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.7rem',
                    marginTop: '2px',
                    display: 'block'
                  }}>
                    {new Date(message.time).toLocaleTimeString('pt-BR')}
                  </small>
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                padding: '20px'
              }}>
                <p>👋 Olá! Como posso ajudá-la hoje?</p>
                <p style={{ fontSize: '0.8rem' }}>Digite sua mensagem abaixo...</p>
              </div>
            )}
          </div>
          
          {/* Input de Mensagem */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid rgba(255, 215, 0, 0.3)',
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua mensagem..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                ...getButtonStyle('primary'),
                padding: '10px 15px',
                fontSize: '0.9rem'
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      )}

      <div className="tab-navigation" style={{ marginBottom: '30px' }}>
        {['services', 'bookings', 'schedule', 'history', 'loyalty'].map(tab => (
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
            {tab === 'bookings' && '📅 Agendamentos'}
            {tab === 'schedule' && '⏰ Agendar'}
            {tab === 'history' && '📋 Histórico'}
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

      {activeTab === 'history' && (
        <div>
          <h2 style={{ color: '#FFD700', marginBottom: '25px', textAlign: 'center' }}>
            📋 Histórico de Serviços
          </h2>
          <div className="dashboard-grid">
            {getServiceHistory().length > 0 ? (
              getServiceHistory().map(service => (
                <div key={service.id} className="dashboard-card">
                  <div className="card-header">
                    <span className="card-icon">✨</span>
                    <h3 className="card-title">{service.serviceName}</h3>
                  </div>
                  <div className="card-content">
                    <p><strong>Data:</strong> {formatDate(service.date)}</p>
                    <p><strong>Horário:</strong> {formatTime(service.time)}</p>
                    <p><strong>Duração:</strong> {service.duration}</p>
                    <p><strong>Valor Pago:</strong> R$ {service.price.toFixed(2)}</p>
                    <p><strong>Status:</strong> 
                      <span style={{ 
                        color: '#4CAF50',
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        Concluído ✓
                      </span>
                    </p>
                    
                    {/* Informações adicionais */}
                    <div style={{
                      marginTop: '15px',
                      padding: '10px',
                      background: 'rgba(255, 215, 0, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}>
                      <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                        💰 <strong>Pontos Ganhos:</strong> {Math.floor(service.price / 5)} pts
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                        🔄 <strong>Repetição:</strong> {service.repeat || 'Primeira vez'}
                      </p>
                      {service.notes && (
                        <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                          📝 <strong>Observações:</strong> {service.notes}
                        </p>
                      )}
                    </div>
                    
                    {/* Botão para reagendar */}
                    <button
                      onClick={() => {
                        setActiveTab('schedule');
                        // Pre-selecionar o mesmo serviço
                      }}
                      style={{
                        ...getButtonStyle('secondary'),
                        marginTop: '10px',
                        width: '100%',
                        fontSize: '0.9rem'
                      }}
                    >
                      🔄 Reagendar Este Serviço
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard-card">
                <div className="card-content" style={{ textAlign: 'center' }}>
                  <h3>📋 Nenhum serviço no histórico</h3>
                  <p>Seus serviços concluídos aparecerão aqui</p>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    style={getButtonStyle('primary')}
                  >
                    Agendar Primeiro Serviço
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Resumo de Estatísticas */}
          {getServiceHistory().length > 0 && (
            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '12px',
              border: '2px solid rgba(255, 215, 0, 0.3)'
            }}>
              <h3 style={{ color: '#FFD700', textAlign: 'center', marginBottom: '20px' }}>
                📊 Suas Estatísticas
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', color: '#FFD700' }}>{getServiceHistory().length}</div>
                  <div style={{ color: 'white', fontSize: '0.9rem' }}>Serviços Realizados</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', color: '#FFD700' }}>
                    R$ {getServiceHistory().reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                  </div>
                  <div style={{ color: 'white', fontSize: '0.9rem' }}>Total Investido</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', color: '#FFD700' }}>
                    {getServiceHistory().reduce((sum, s) => sum + Math.floor(s.price / 5), 0)}
                  </div>
                  <div style={{ color: 'white', fontSize: '0.9rem' }}>Pontos Acumulados</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', color: '#FFD700' }}>
                    {getServiceHistory().length > 0 ? 
                      Math.round(getServiceHistory().reduce((sum, s) => sum + s.price, 0) / getServiceHistory().length) : 0}
                  </div>
                  <div style={{ color: 'white', fontSize: '0.9rem' }}>Ticket Médio</div>
                </div>
              </div>
            </div>
          )}
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

      {/* Modal de Edição de Perfil */}
      {showProfileModal && (
        <UserProfile onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};

export default ClientDashboard;