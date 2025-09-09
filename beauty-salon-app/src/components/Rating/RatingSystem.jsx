import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';

const RatingSystem = ({ bookingId, serviceName, onRatingSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Verificar se já existe avaliação para este agendamento
    const ratings = JSON.parse(localStorage.getItem('serviceRatings') || '[]');
    const existingRating = ratings.find(r => r.bookingId === bookingId && r.userId === user.id);
    
    if (existingRating) {
      setRating(existingRating.rating);
      setComment(existingRating.comment);
      setSubmitted(true);
    }
  }, [bookingId, user.id]);

  const handleSubmit = () => {
    if (rating === 0) return;

    const newRating = {
      id: Date.now().toString(),
      bookingId,
      userId: user.id,
      userName: user.name,
      serviceName,
      rating,
      comment,
      date: new Date().toISOString()
    };

    const ratings = JSON.parse(localStorage.getItem('serviceRatings') || '[]');
    const existingIndex = ratings.findIndex(r => r.bookingId === bookingId && r.userId === user.id);
    
    if (existingIndex !== -1) {
      ratings[existingIndex] = newRating;
    } else {
      ratings.push(newRating);
    }
    
    localStorage.setItem('serviceRatings', JSON.stringify(ratings));
    setSubmitted(true);
    
    if (onRatingSubmit) {
      onRatingSubmit(newRating);
    }
  };

  const StarRating = ({ value, onChange, readOnly = false }) => {
    return (
      <div style={{ display: 'flex', gap: '5px', fontSize: '1.5rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => !readOnly && onChange && onChange(star)}
            style={{
              color: star <= value ? '#FFD700' : 'rgba(255, 255, 255, 0.3)',
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!readOnly) e.target.style.color = '#FFD700';
            }}
            onMouseLeave={(e) => {
              if (!readOnly && star > value) e.target.style.color = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="rating-container" style={{
      ...getCardStyle(true),
      padding: '20px',
      marginTop: '15px'
    }}>
      <h4 style={{ color: '#FFD700', marginBottom: '15px' }}>
        {submitted ? '✅ Sua Avaliação' : '⭐ Avalie este Serviço'}
      </h4>
      
      <div style={{ marginBottom: '15px' }}>
        <p style={{ marginBottom: '10px', color: 'rgba(255, 255, 255, 0.9)' }}>
          <strong>Serviço:</strong> {serviceName}
        </p>
        <StarRating 
          value={rating} 
          onChange={setRating}
          readOnly={submitted}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte-nos sobre sua experiência..."
          disabled={submitted}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            background: submitted ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            resize: 'vertical',
            minHeight: '80px'
          }}
        />
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          style={{
            ...getButtonStyle('primary'),
            width: '100%',
            opacity: rating === 0 ? 0.5 : 1
          }}
        >
          Enviar Avaliação
        </button>
      )}

      {submitted && (
        <div style={{
          background: 'rgba(76, 175, 80, 0.1)',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          color: '#66BB6A'
        }}>
          Obrigado pela sua avaliação! 🙏
        </div>
      )}
    </div>
  );
};

export default RatingSystem;