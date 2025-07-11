import React from 'react'

interface SessionStatusProps {
  conversationId: string | null
  messageCount: number
  selectedModel: string
}

const SessionStatus: React.FC<SessionStatusProps> = ({ 
  conversationId, 
  messageCount, 
  selectedModel 
}) => {
  return (
    <div className="session-status" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '12px',
      color: '#666',
      padding: '4px 8px',
      borderRadius: '6px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e0e0e0'
    }}>
      <div className="session-info">
        <span>Session: {conversationId ? conversationId.slice(0, 8) : 'New'}</span>
      </div>
      <div className="separator" style={{
        width: '1px',
        height: '12px',
        backgroundColor: '#ddd'
      }} />
      <div className="message-count">
        <span>{messageCount} messages</span>
      </div>
      <div className="separator" style={{
        width: '1px',
        height: '12px',
        backgroundColor: '#ddd'
      }} />
      <div className="model-info">
        <span>Model: {selectedModel}</span>
      </div>
    </div>
  )
}

export default SessionStatus