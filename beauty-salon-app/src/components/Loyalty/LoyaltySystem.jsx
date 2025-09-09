import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';

const LoyaltySystem = () => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState({
    points: 0,
    level: 'Bronze',
    nextReward: 100,
    canParticipateInDraw: false,
    lastDrawParticipation: null,
    totalVisits: 0
  });
  const [drawResult, setDrawResult] = useState(null);
  const [showDraw, setShowDraw] = useState(false);

  const levels = {
    Bronze: { min: 0, color: '#CD7F32', benefits: ['5% desconto em serviços'] },
    Prata: { min: 100, color: '#C0C0C0', benefits: ['10% desconto', 'Agendamento prioritário'] },
    Ouro: { min: 250, color: '#FFD700', benefits: ['15% desconto', 'Serviço premium grátis mensalmente'] },
    Diamante: { min: 500, color: '#B9F2FF', benefits: ['20% desconto', 'Acesso a serviços VIP', 'Brindes exclusivos'] }
  };

  const prizes = [
    { name: 'Desconto 50% próximo serviço', rarity: 'comum', emoji: '🎁' },
    { name: 'Manicure completa GRÁTIS', rarity: 'raro', emoji: '💅' },
    { name: 'Kit produtos premium', rarity: 'épico', emoji: '✨' },
    { name: 'Dia de SPA completo', rarity: 'lendário', emoji: '👑' }
  ];

  useEffect(() => {
    loadLoyaltyData();
  }, [user.id]);

  const loadLoyaltyData = () => {
    const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const userBookings = bookings.filter(b => b.userId === user.id && b.status !== 'cancelled');
    
    const userStats = stats[user.id] || {
      loyaltyPoints: 0,
      totalVisits: 0,
      lastDrawParticipation: null
    };

    const points = userStats.loyaltyPoints || 0;
    const level = getCurrentLevel(points);
    const canDraw = canParticipateInDraw(userStats.lastDrawParticipation, userBookings.length);

    setLoyaltyData({
      points,
      level,
      nextReward: getNextLevelPoints(level),
      canParticipateInDraw: canDraw,
      lastDrawParticipation: userStats.lastDrawParticipation,
      totalVisits: userBookings.length
    });
  };

  const getCurrentLevel = (points) => {
    if (points >= 500) return 'Diamante';
    if (points >= 250) return 'Ouro';
    if (points >= 100) return 'Prata';
    return 'Bronze';
  };

  const getNextLevelPoints = (currentLevel) => {
    const levelOrder = ['Bronze', 'Prata', 'Ouro', 'Diamante'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    if (currentIndex === levelOrder.length - 1) return null;
    
    const nextLevel = levelOrder[currentIndex + 1];
    return levels[nextLevel].min;
  };

  const canParticipateInDraw = (lastParticipation, totalVisits) => {
    if (!lastParticipation) return totalVisits >= 1;
    
    const lastDate = new Date(lastParticipation);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - lastDate.getFullYear()) * 12 + 
                     (now.getMonth() - lastDate.getMonth());
    
    return monthsDiff >= 1 && totalVisits >= 1;
  };

  const participateInDraw = () => {
    setShowDraw(true);
    
    // Simular sorteio com base na interação do usuário
    const interactionBonus = loyaltyData.totalVisits * 0.1;
    const baseChance = 0.3 + Math.min(interactionBonus, 0.4);
    
    const random = Math.random();
    let selectedPrize = null;
    
    if (random < baseChance) {
      // Determinar raridade do prêmio
      const rarityRoll = Math.random();
      let rarity;
      
      if (rarityRoll < 0.5) rarity = 'comum';
      else if (rarityRoll < 0.8) rarity = 'raro';
      else if (rarityRoll < 0.95) rarity = 'épico';
      else rarity = 'lendário';
      
      const availablePrizes = prizes.filter(p => p.rarity === rarity);
      selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
    }

    setDrawResult(selectedPrize);

    // Atualizar dados de participação
    const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
    if (!stats[user.id]) stats[user.id] = {};
    stats[user.id].lastDrawParticipation = new Date().toISOString();
    
    if (selectedPrize) {
      // Salvar prêmio ganho
      const prizes = JSON.parse(localStorage.getItem('userPrizes') || '[]');
      prizes.push({
        id: Date.now().toString(),
        userId: user.id,
        prize: selectedPrize,
        wonAt: new Date().toISOString(),
        used: false
      });
      localStorage.setItem('userPrizes', JSON.stringify(prizes));
    }
    
    localStorage.setItem('userStats', JSON.stringify(stats));
    
    setTimeout(() => {
      setShowDraw(false);
      loadLoyaltyData();
    }, 3000);
  };

  const progressPercentage = loyaltyData.nextReward ? 
    ((loyaltyData.points % loyaltyData.nextReward) / loyaltyData.nextReward) * 100 : 100;

  return (
    <div className="loyalty-container">
      {/* Status de Fidelidade */}
      <div className="dashboard-card" style={getCardStyle(true)}>
        <div className="card-header">
          <span className="card-icon">🏆</span>
          <h3 className="card-title">Status de Fidelidade</h3>
        </div>
        <div className="card-content">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div>
              <h4 style={{ 
                color: levels[loyaltyData.level].color, 
                fontSize: '1.5rem',
                margin: 0 
              }}>
                Nível {loyaltyData.level}
              </h4>
              <p style={{ margin: '5px 0', color: 'rgba(255, 255, 255, 0.8)' }}>
                {loyaltyData.points} pontos acumulados
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2rem' }}>
                {loyaltyData.level === 'Bronze' && '🥉'}
                {loyaltyData.level === 'Prata' && '🥈'}
                {loyaltyData.level === 'Ouro' && '🥇'}
                {loyaltyData.level === 'Diamante' && '💎'}
              </span>
            </div>
          </div>

          {loyaltyData.nextReward && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '10px', color: 'rgba(255, 255, 255, 0.9)' }}>
                Próximo nível em {loyaltyData.nextReward - loyaltyData.points} pontos
              </p>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${levels[loyaltyData.level].color}, #FFD700)`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}

          <div>
            <p style={{ marginBottom: '10px', color: '#FFD700', fontWeight: 'bold' }}>
              Benefícios do seu nível:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255, 255, 255, 0.9)' }}>
              {levels[loyaltyData.level].benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sistema de Sorteio */}
      <div className="dashboard-card" style={getCardStyle(true)}>
        <div className="card-header">
          <span className="card-icon">🎰</span>
          <h3 className="card-title">Sorteio Mensal</h3>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '15px', color: 'rgba(255, 255, 255, 0.9)' }}>
            Participe do sorteio mensal e ganhe prêmios incríveis! 
            Quanto mais você interage conosco, maiores suas chances! 🍀
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Suas chances: {Math.min(30 + (loyaltyData.totalVisits * 10), 70)}%
              <br />
              <small>Base: 30% + {loyaltyData.totalVisits * 10}% por interações</small>
            </p>
          </div>

          {loyaltyData.canParticipateInDraw ? (
            <button
              onClick={participateInDraw}
              disabled={showDraw}
              style={{
                ...getButtonStyle('primary'),
                width: '100%'
              }}
            >
              {showDraw ? '🎰 Sorteando...' : '🎲 Participar do Sorteio'}
            </button>
          ) : (
            <div style={{
              background: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center',
              color: '#FFB74D'
            }}>
              Você já participou este mês! 
              <br />
              <small>Volte no próximo mês para uma nova chance! 📅</small>
            </div>
          )}

          {showDraw && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
              borderRadius: '12px',
              textAlign: 'center',
              animation: 'pulse 2s infinite'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎰</div>
              <p>Sorteando seu prêmio...</p>
            </div>
          )}

          {drawResult && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                {drawResult.emoji}
              </div>
              <h4 style={{ margin: '0 0 10px 0' }}>Parabéns! 🎉</h4>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                Você ganhou: {drawResult.name}
              </p>
            </div>
          )}

          {drawResult === null && showDraw && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#FFB74D'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>😔</div>
              <p>Não foi desta vez! Tente novamente no próximo mês.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltySystem;