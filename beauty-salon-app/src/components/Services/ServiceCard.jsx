import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';

const ServiceCard = ({ service, isBirthday, onBook }) => {
  const discountedPrice = isBirthday ? service.price * 0.9 : service.price;
  const hasDiscount = service.originalPrice && service.originalPrice > service.price;

  return (
    <div 
      className="dashboard-card service-card" 
      style={{
        ...getCardStyle(true),
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isBirthday && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'linear-gradient(135deg, #FFD700, #FFF8DC)',
          color: '#000',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: 'bold'
        }}>
          🎂 -10%
        </div>
      )}

      {hasDiscount && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: 'bold'
        }}>
          PROMOÇÃO
        </div>
      )}

      <div className="card-header">
        <span className="card-icon" style={{ fontSize: '2rem' }}>
          {service.image}
        </span>
        <h3 className="card-title">{service.name}</h3>
      </div>

      <div className="card-content">
        <p style={{ marginBottom: '15px', opacity: 0.9 }}>
          {service.description}
        </p>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>
              R$ {discountedPrice.toFixed(2)}
            </span>
            {isBirthday && (
              <span style={{ 
                textDecoration: 'line-through', 
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1rem'
              }}>
                R$ {service.price.toFixed(2)}
              </span>
            )}
            {hasDiscount && (
              <span style={{ 
                textDecoration: 'line-through', 
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1rem'
              }}>
                R$ {service.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: 'rgba(255,255,255,0.8)'
          }}>
            <span>⏱️</span>
            <span>{service.duration}</span>
          </div>
        </div>

        <button
          onClick={onBook}
          style={{
            ...getButtonStyle('primary'),
            width: '100%',
            fontSize: '0.9rem'
          }}
        >
          Agendar Agora
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;