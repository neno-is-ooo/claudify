import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface Conversation {
  id: string
  title: string
  messages: any[]
  createdAt: number
  updatedAt: number
}

interface ConversationSidebarProps {
  currentConversationId: string | null
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
  onDeleteConversation: (conversationId: string) => void
  onExportConversation: (conversationId: string, format: 'json' | 'markdown' | 'api-json') => void
  onUseAsContext: (conversationId: string) => void
  refreshTrigger?: number
  isVisible: boolean
  onToggle: () => void
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  onExportConversation,
  onUseAsContext,
  refreshTrigger,
  isVisible,
  onToggle
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState<string | null>(null)
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set())
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)

  useEffect(() => {
    if (isVisible) {
      loadConversations()
    }
  }, [refreshTrigger, isVisible])

  const loadConversations = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/conversations')
      setConversations(response.data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const searchConversations = async () => {
    if (!searchQuery.trim()) {
      loadConversations()
      return
    }

    setIsSearching(true)
    try {
      const response = await axios.post('http://localhost:3001/api/conversations/search', {
        query: searchQuery
      })
      setConversations(response.data)
    } catch (error) {
      console.error('Failed to search conversations:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDelete = async (conversationId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await onDeleteConversation(conversationId)
      loadConversations()
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const toggleConversationSelection = (conversationId: string) => {
    setSelectedConversations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId)
      } else {
        newSet.add(conversationId)
      }
      return newSet
    })
  }

  const selectAllConversations = () => {
    setSelectedConversations(new Set(conversations.map(c => c.id)))
  }

  const clearSelection = () => {
    setSelectedConversations(new Set())
    setIsMultiSelectMode(false)
  }

  const deleteBulkConversations = async () => {
    if (selectedConversations.size === 0) return
    
    const confirmMessage = `Are you sure you want to delete ${selectedConversations.size} conversation(s)?`
    if (window.confirm(confirmMessage)) {
      try {
        // Delete each selected conversation
        for (const conversationId of selectedConversations) {
          await onDeleteConversation(conversationId)
        }
        
        // Clear selection and reload
        clearSelection()
        loadConversations()
      } catch (error) {
        console.error('Failed to delete conversations:', error)
      }
    }
  }

  return (
    <>

      {/* Sidebar */}
      <div 
        className="conversation-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: isVisible ? 0 : '-300px',
          width: '300px',
          height: '100vh',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #ddd',
          zIndex: 999,
          transition: 'left 0.3s ease',
          padding: '20px',
          boxSizing: 'border-box',
          overflow: 'auto'
        }}
      >
        <div className="sidebar-header" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Conversations</h3>
          
          {/* Bulk actions bar */}
          {isMultiSelectMode && (
            <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#e8f4f8', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#333' }}>
                  {selectedConversations.size} selected
                </span>
                <button
                  onClick={clearSelection}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Cancel
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={selectAllConversations}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #007bff',
                    backgroundColor: '#fff',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={deleteBulkConversations}
                  disabled={selectedConversations.size === 0}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #dc3545',
                    backgroundColor: selectedConversations.size === 0 ? '#f8f9fa' : '#dc3545',
                    color: selectedConversations.size === 0 ? '#6c757d' : '#fff',
                    cursor: selectedConversations.size === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete ({selectedConversations.size})
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="new-conversation-btn"
              onClick={onNewConversation}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #007bff',
                backgroundColor: '#007bff',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New Chat
            </button>
            <button
              onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #6c757d',
                backgroundColor: isMultiSelectMode ? '#6c757d' : '#fff',
                color: isMultiSelectMode ? '#fff' : '#6c757d',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 11l3 3l8-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.04 0 2.04.18 2.97.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="search-container" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchConversations()}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
            <button 
              className="search-btn" 
              onClick={searchConversations}
              disabled={isSearching}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="conversation-list">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              className={`conversation-item ${currentConversationId === conversation.id ? 'active' : ''}`}
              onClick={() => {
                if (isMultiSelectMode) {
                  toggleConversationSelection(conversation.id)
                } else {
                  onConversationSelect(conversation.id)
                }
              }}
              style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                border: `1px solid ${selectedConversations.has(conversation.id) ? '#007bff' : '#e0e0e0'}`,
                backgroundColor: selectedConversations.has(conversation.id) 
                  ? '#e3f2fd' 
                  : currentConversationId === conversation.id ? '#e3f2fd' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div className="conversation-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isMultiSelectMode && (
                    <input
                      type="checkbox"
                      checked={selectedConversations.has(conversation.id)}
                      onChange={() => toggleConversationSelection(conversation.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ margin: 0 }}
                    />
                  )}
                  <h4 style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>
                    {conversation.title}
                  </h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                  <span className="conversation-date">{formatDate(conversation.updatedAt)}</span>
                  <span className="message-count">{conversation.messages.length} messages</span>
                </div>
              </div>
              {!isMultiSelectMode && (
                <div className="conversation-actions" style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowExportMenu(showExportMenu === conversation.id ? null : conversation.id)
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Export
                </button>
                {showExportMenu === conversation.id && (
                  <div 
                    className="export-menu"
                    style={{
                      position: 'absolute',
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '8px',
                      zIndex: 1001,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      minWidth: '120px'
                    }}
                  >
                    <button 
                      onClick={() => {
                        onExportConversation(conversation.id, 'json')
                        setShowExportMenu(null)
                      }}
                      style={{ display: 'block', width: '100%', padding: '4px 8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '12px', textAlign: 'left' }}
                    >
                      Export as JSON
                    </button>
                    <button 
                      onClick={() => {
                        onExportConversation(conversation.id, 'markdown')
                        setShowExportMenu(null)
                      }}
                      style={{ display: 'block', width: '100%', padding: '4px 8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '12px', textAlign: 'left' }}
                    >
                      Export as Markdown
                    </button>
                    <button 
                      onClick={() => {
                        onExportConversation(conversation.id, 'api-json')
                        setShowExportMenu(null)
                      }}
                      style={{ display: 'block', width: '100%', padding: '4px 8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '12px', textAlign: 'left' }}
                    >
                      Export API Data
                    </button>
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #eee' }} />
                    <button 
                      onClick={() => {
                        onUseAsContext(conversation.id)
                        setShowExportMenu(null)
                      }}
                      style={{ display: 'block', width: '100%', padding: '4px 8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '12px', textAlign: 'left', color: '#007bff' }}
                    >
                      Use as Context
                    </button>
                  </div>
                )}
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(conversation.id)
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #dc3545',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {isVisible && (
        <div
          className="sidebar-overlay"
          onClick={onToggle}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 998
          }}
        />
      )}
    </>
  )
}

export default ConversationSidebar