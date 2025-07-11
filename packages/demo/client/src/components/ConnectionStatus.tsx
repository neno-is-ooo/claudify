import React from 'react'

interface ConnectionStatusProps {
  isConnected: boolean
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <span className="status-dot"></span>
      <span className="status-text">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )
}

export default ConnectionStatus