import { useState } from 'react';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';
import n8nService from '../../services/n8nService';

const BookingForm = ({ services, user, isBirthday, onBookingComplete }) => {
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Horários disponíveis (Segunda a Sábado, 8:00 às 18:00)
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  const selectedService = services.find(s => s.id.toString() === formData.serviceId);

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day >= 1 && day <= 6; // Segunda (1) a Sábado (6)
  };

  const isTimeSlotAvailable = (time, date) => {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const dateTimeStr = `${date}T${time}`;
    
    return !bookings.some(booking => 
      booking.date === date && 
      booking.time === time &&
      booking.status !== 'cancelled'
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!isValidDate(formData.date)) {
      setMessage('Por favor, selecione uma data entre segunda e sábado.');
      setLoading(false);
      return;
    }

    if (!isTimeSlotAvailable(formData.time, formData.date)) {
      setMessage('Este horário já está ocupado. Escolha outro.');
      setLoading(false);
      return;
    }

    try {
      const service = services.find(s => s.id.toString() === formData.serviceId);
      const finalPrice = isBirthday ? service.price * 0.9 : service.price;

      const booking = {
        id: Date.now().toString(),
        userId: user.id,
        serviceId: service.id,
        serviceName: service.name,
        date: formData.date,
        time: formData.time,
        duration: service.duration,
        price: finalPrice,
        originalPrice: service.price,
        notes: formData.notes,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        birthdayDiscount: isBirthday
      };

      // Salvar agendamento
      const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      bookings.push(booking);
      localStorage.setItem('userBookings', JSON.stringify(bookings));

      // Atualizar estatísticas do usuário
      const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
      if (!stats[user.id]) {
        stats[user.id] = {
          totalVisits: 0,
          loyaltyPoints: 0,
          nextReward: 100,
          lastVisit: null
        };
      }
      stats[user.id].loyaltyPoints += Math.floor(finalPrice / 10);
      stats[user.id].lastVisit = new Date().toISOString();
      localStorage.setItem('userStats', JSON.stringify(stats));

      // 🤖 AUTOMAÇÃO N8N - Processar novo agendamento
      try {
        const automationResult = await n8nService.automate_newBooking(booking, user);
        
        if (automationResult.booking?.success) {
          setMessage('Agendamento realizado com sucesso! 🎉\n\n✅ Confirmação enviada por email\n✅ Lembrete programado via WhatsApp\n✅ Profissional notificado');
        } else {
          setMessage('Agendamento realizado com sucesso! 🎉\n\n📧 Confirmação será enviada em breve');
        }
        
        console.log('🚀 Automações N8n ativadas:', automationResult);
        
      } catch (error) {
        console.warn('⚠️ Automação N8n indisponível:', error);
        setMessage('Agendamento realizado com sucesso! 🎉');
      }
      
      setFormData({
        serviceId: '',
        date: '',
        time: '',
        notes: ''
      });

      setTimeout(() => {
        onBookingComplete();
      }, 3000);

    } catch (error) {
      setMessage('Erro ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="dashboard-card" style={getCardStyle(true)}>
      <div className="card-header">
        <span className="card-icon">📅</span>
        <h3 className="card-title">Agendar Serviço</h3>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#FFD700',
            fontWeight: '600'
          }}>
            Selecione o Serviço *
          </label>
          <select
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              fontSize: '1rem'
            }}
          >
            <option value="">Escolha um serviço</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - R$ {isBirthday ? (service.price * 0.9).toFixed(2) : service.price.toFixed(2)} ({service.duration})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#FFD700',
            fontWeight: '600'
          }}>
            Data *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={getMinDate()}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          <small style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
            Funcionamos de segunda a sábado
          </small>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#FFD700',
            fontWeight: '600'
          }}>
            Horário *
          </label>
          <select
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              fontSize: '1rem'
            }}
          >
            <option value="">Escolha um horário</option>
            {timeSlots.map(time => (
              <option 
                key={time} 
                value={time}
                disabled={formData.date && !isTimeSlotAvailable(time, formData.date)}
              >
                {time} {formData.date && !isTimeSlotAvailable(time, formData.date) ? '(Ocupado)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#FFD700',
            fontWeight: '600'
          }}>
            Observações
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Alguma observação especial?"
            rows="3"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        {selectedService && (
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <h4 style={{ color: '#FFD700', margin: '0 0 10px 0' }}>Resumo do Agendamento</h4>
            <p style={{ margin: '5px 0', color: 'white' }}>
              <strong>Serviço:</strong> {selectedService.name}
            </p>
            <p style={{ margin: '5px 0', color: 'white' }}>
              <strong>Duração:</strong> {selectedService.duration}
            </p>
            <p style={{ margin: '5px 0', color: 'white' }}>
              <strong>Valor:</strong> R$ {isBirthday ? (selectedService.price * 0.9).toFixed(2) : selectedService.price.toFixed(2)}
              {isBirthday && (
                <span style={{ marginLeft: '10px', color: '#4CAF50' }}>
                  🎂 Desconto de aniversário aplicado!
                </span>
              )}
            </p>
          </div>
        )}

        {message && (
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: '500',
            background: message.includes('sucesso') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            border: `1px solid ${message.includes('sucesso') ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
            color: message.includes('sucesso') ? '#66BB6A' : '#FF6B6B'
          }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...getButtonStyle('primary'),
            fontSize: '1rem'
          }}
        >
          {loading ? 'Agendando...' : 'Confirmar Agendamento'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;