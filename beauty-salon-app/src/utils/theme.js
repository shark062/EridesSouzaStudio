
export const theme = {
  colors: {
    primary: {
      sage: '#8B9D83',        // Verde sage principal
      darkSage: '#6B7A63',    // Verde sage mais escuro
      lightSage: '#A8B5A0',   // Verde sage mais claro
      cream: '#F8F6F0',       // Creme/off-white
      warmBeige: '#D4B896',   // Bege dourado
      deepGold: '#B8860B'     // Dourado mais escuro para detalhes
    },
    secondary: {
      white: '#FFFFFF',
      lightCream: '#FEFCF7',
      softBeige: '#E8DCC0',
      mutedSage: '#9CAA94'
    },
    accent: {
      success: '#7FB069',
      warning: '#E4A853',
      error: '#C17767',
      info: '#7A9CC6'
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #8B9D83 0%, #6B7A63 100%)',
    warm: 'linear-gradient(135deg, #D4B896 0%, #B8860B 100%)',
    card: 'linear-gradient(135deg, rgba(139, 157, 131, 0.1) 0%, rgba(248, 246, 240, 0.9) 100%)',
    translucent: 'linear-gradient(135deg, rgba(139, 157, 131, 0.05) 0%, rgba(248, 246, 240, 0.95) 100%)',
    header: 'linear-gradient(135deg, #F8F6F0 0%, #E8DCC0 50%, #D4B896 100%)'
  },
  shadows: {
    soft: '0 4px 20px rgba(139, 157, 131, 0.15)',
    medium: '0 8px 30px rgba(139, 157, 131, 0.2)',
    strong: '0 12px 40px rgba(139, 157, 131, 0.25)',
    glow: '0 0 20px rgba(212, 184, 150, 0.3)'
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
  background: transparent ? 'rgba(248, 246, 240, 0.8)' : 'rgba(248, 246, 240, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid rgba(139, 157, 131, 0.3)`,
  borderRadius: theme.borderRadius.medium,
  boxShadow: theme.shadows.soft,
  color: theme.colors.primary.darkSage
});

export const getButtonStyle = (variant = 'primary') => {
  const styles = {
    primary: {
      background: theme.gradients.primary,
      color: theme.colors.primary.cream,
      border: 'none',
      boxShadow: theme.shadows.medium,
      '&:hover': {
        boxShadow: theme.shadows.glow,
        transform: 'translateY(-2px)'
      }
    },
    secondary: {
      background: 'transparent',
      color: theme.colors.primary.sage,
      border: `2px solid ${theme.colors.primary.sage}`,
      '&:hover': {
        background: theme.colors.primary.sage,
        color: theme.colors.primary.cream
      }
    },
    warm: {
      background: theme.gradients.warm,
      color: theme.colors.primary.cream,
      border: 'none',
      '&:hover': {
        boxShadow: theme.shadows.glow
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
