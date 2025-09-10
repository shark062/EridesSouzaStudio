
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SyncStatus = () => {
  const { syncStatus, syncWithServer } = useAuth();

  const getStatusInfo = () => {
    switch (syncStatus) {
      case 'connected':
        return {
          icon: '🟢',
          text: 'Conectado',
          color: '#4CAF50'
        };
      case 'syncing':
        return {
          icon: '🔄',
          text: 'Sincronizando...',
          color: '#FF9800'
        };
      case 'offline':
        return {
          icon: '🟡',
          text: 'Modo Offline',
          color: '#FFC107'
        };
      default:
        return {
          icon: '🔴',
          text: 'Desconectado',
          color: '#F44336'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div 
      onClick={syncWithServer}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        color: statusInfo.color,
        border: `1px solid ${statusInfo.color}`,
        transition: 'all 0.3s ease'
      }}
      title="Clique para sincronizar manualmente"
    >
      <span>{statusInfo.icon}</span>
      <span>{statusInfo.text}</span>
    </div>
  );
};

export default SyncStatus;
