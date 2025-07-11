import React, { useContext, useEffect, useRef } from 'react'
import { useLogic } from '../hooks/useLogic'
import { GlobalContext } from '../contexts/global'
import { useTheme } from '../hooks/useTheme'
import { ChatPageLogic, Message } from './chat.logic'
import { navigate } from '../routes'
import { LoadingSpinner } from '../components/LoadingSpinner'
import ModelSelector from '../components/ModelSelector'
import ConnectionStatus from '../components/ConnectionStatus'
import ConversationSidebar from '../components/ConversationSidebar'
import SessionStatus from '../components/SessionStatus'
import MarkdownMessage from '../components/MarkdownMessage'

export default function ChatPage() {
    const { services, storage } = useContext(GlobalContext)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { logic, state } = useLogic(ChatPageLogic, {
        services,
        redirect: (path) => navigate(path),
    })

    const { theme, variant } = useTheme()

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [state.messages, state.streamingContent])

    const renderMessage = (message: Message) => {
        const isUser = message.role === 'user'
        return (
            <div
                key={message.id}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    marginBottom: '16px',
                    width: '100%'
                }}
            >
                <div
                    style={{
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: '18px',
                        backgroundColor: isUser 
                            ? theme.primary.foreground 
                            : variant === 'dark' ? '#2a2a2a' : '#f0f0f0',
                        wordWrap: 'break-word',
                    }}
                >
                    <MarkdownMessage content={message.content} isUser={isUser} />
                </div>
                <div
                    style={{
                        fontSize: '12px',
                        color: variant === 'dark' ? '#888' : '#666',
                        marginTop: '4px',
                        opacity: 0.7
                    }}
                >
                    {new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>
        )
    }

    if (state.loadState === 'running') {
        return (
            <div
                className="loading-container"
                style={{
                    backgroundColor: theme.primary.background,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <LoadingSpinner
                    size={40}
                    color={theme.primary.foreground}
                />
            </div>
        )
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                width: '100%',
                backgroundColor: theme.primary.background,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
        >
            <ConversationSidebar
                currentConversationId={state.currentConversationId}
                onConversationSelect={logic.selectConversation}
                onNewConversation={logic.newConversation}
                onDeleteConversation={logic.deleteConversation}
                onExportConversation={logic.exportConversation}
                onUseAsContext={logic.useAsContext}
                isVisible={state.sidebarVisible}
                onToggle={logic.toggleSidebar}
                refreshTrigger={state.messages.length}
            />
            {/* Header */}
            <header
                style={{
                    backgroundColor: theme.primary.background,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px',
                    borderBottom: `1px solid ${variant === 'dark' ? '#333' : '#eee'}`,
                    flexShrink: 0
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 style={{ 
                        margin: 0, 
                        color: theme.primary.foreground,
                        fontSize: '18px',
                        fontWeight: '600'
                    }}>
                        Claude Code SDK Demo
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <ConnectionStatus isConnected={state.isConnected} />
                    <SessionStatus 
                        conversationId={state.currentConversationId}
                        messageCount={state.messages.length}
                        selectedModel={state.selectedModel}
                    />
                    <ModelSelector 
                        selectedModel={state.selectedModel}
                        onModelChange={logic.setSelectedModel}
                        disabled={state.sendState === 'running'}
                    />
                    <button
                        onClick={logic.clearMessages}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.primary.foreground}`,
                            backgroundColor: 'transparent',
                            color: theme.primary.foreground,
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Clear Chat
                    </button>
                    <button
                        onClick={logic.toggleSidebar}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.primary.foreground}`,
                            backgroundColor: state.sidebarVisible ? theme.primary.foreground : 'transparent',
                            color: state.sidebarVisible ? theme.primary.background : theme.primary.foreground,
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        📁 Conversations
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <main
                style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {state.errorMessage && (
                    <div
                        style={{
                            padding: '12px',
                            marginBottom: '16px',
                            borderRadius: '8px',
                            backgroundColor: '#fee',
                            color: '#c33',
                            border: '1px solid #fcc',
                        }}
                    >
                        {state.errorMessage}
                    </div>
                )}

                {state.messages.map(renderMessage)}

                {/* Streaming message */}
                {state.isStreaming && state.streamingContent && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            marginBottom: '16px',
                            width: '100%'
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '70%',
                                padding: '12px 16px',
                                borderRadius: '18px',
                                backgroundColor: variant === 'dark' ? '#2a2a2a' : '#f0f0f0',
                                wordWrap: 'break-word',
                            }}
                        >
                            <MarkdownMessage content={state.streamingContent + ' ▌'} isUser={false} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <div
                style={{
                    padding: '20px',
                    borderTop: `1px solid ${variant === 'dark' ? '#333' : '#eee'}`,
                    backgroundColor: theme.primary.background,
                    flexShrink: 0
                }}
            >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                    <textarea
                        value={state.currentInput}
                        onChange={(e) => logic.setCurrentInput(e.target.value)}
                        onKeyDown={(e) => logic.handleKeyPress(e)}
                        placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                        style={{
                            flex: 1,
                            minHeight: '44px',
                            maxHeight: '120px',
                            padding: '12px 16px',
                            borderRadius: '22px',
                            border: `1px solid ${variant === 'dark' ? '#444' : '#ddd'}`,
                            backgroundColor: variant === 'dark' ? '#2a2a2a' : '#fff',
                            color: theme.primary.foreground,
                            outline: 'none',
                            resize: 'none',
                            fontFamily: 'inherit',
                            fontSize: '14px',
                            lineHeight: '1.4'
                        }}
                        rows={1}
                    />
                    <button
                        onClick={logic.sendMessage}
                        disabled={!state.currentInput.trim() || state.sendState === 'running'}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '22px',
                            border: 'none',
                            backgroundColor: theme.primary.foreground,
                            color: theme.primary.background,
                            cursor: state.currentInput.trim() && state.sendState !== 'running' ? 'pointer' : 'not-allowed',
                            fontSize: '14px',
                            fontWeight: '600',
                            opacity: state.currentInput.trim() && state.sendState !== 'running' ? 1 : 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {state.sendState === 'running' ? (
                            <>
                                <LoadingSpinner size={16} color={theme.primary.background} />
                                Sending...
                            </>
                        ) : (
                            'Send'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}