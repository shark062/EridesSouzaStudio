export const theme = {
  colors: {
    primary: {
      black: '#000000',
      darkGray: '#1a1a1a',
      charcoal: '#2d2d2d',
      gold: '#FFD700',
      lightGold: '#FFF8DC',
      darkGold: '#B8860B'
    },
    secondary: {
      white: '#FFFFFF',
      lightGray: '#F5F5F5',
      mediumGray: '#CCCCCC'
    },
    accent: {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #000000 0%, #2d2d2d 100%)',
    gold: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
    card: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
    translucent: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(0, 0, 0, 0.9) 100%)'
  },
  shadows: {
    soft: '0 4px 20px rgba(255, 215, 0, 0.1)',
    medium: '0 8px 30px rgba(255, 215, 0, 0.2)',
    strong: '0 12px 40px rgba(255, 215, 0, 0.3)',
    glow: '0 0 20px rgba(255, 215, 0, 0.4)'
  },
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '16px',
    xl: '24px'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  }
};

export const getCardStyle = (transparent = false) => ({
  background: 'rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.colors.primary.gold}40`,
  borderRadius: theme.borderRadius.medium,
  boxShadow: theme.shadows.soft,
  color: theme.colors.secondary.white
});

export const getButtonStyle = (variant = 'primary') => {
  const styles = {
    primary: {
      background: theme.gradients.gold,
      color: theme.colors.primary.black,
      border: 'none',
      boxShadow: theme.shadows.medium,
      '&:hover': {
        boxShadow: theme.shadows.glow,
        transform: 'translateY(-2px)'
      }
    },
    secondary: {
      background: 'transparent',
      color: theme.colors.primary.gold,
      border: `2px solid ${theme.colors.primary.gold}`,
      '&:hover': {
        background: theme.colors.primary.gold,
        color: theme.colors.primary.black
      }
    },
    danger: {
      background: theme.colors.accent.error,
      color: theme.colors.secondary.white,
      border: 'none'
    }
  };
  
  return {
    ...styles[variant],
    borderRadius: theme.borderRadius.medium,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };
};