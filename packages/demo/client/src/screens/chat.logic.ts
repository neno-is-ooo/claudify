import React from 'react'
import { FrontendServices } from '@/services/types'
import { Logic } from '@/utils/logic'
import { executeTask, TaskState } from '@/utils/tasks'
import { io, Socket } from 'socket.io-client'
import axios from 'axios'

// Real WebSocket client that connects to the existing web-app backend
class ClaudeWebSocketClient {
    private socket: Socket | null = null
    private connected: boolean = false

    constructor() {
        this.connect()
    }

    private connect() {
        // Connect to the existing web-app server
        this.socket = io('http://localhost:3001')

        this.socket.on('connect', () => {
            this.connected = true
            console.log('✅ Connected to Claude Code backend server')
        })

        this.socket.on('disconnect', () => {
            this.connected = false
            console.log('❌ Disconnected from backend server')
        })

        this.socket.on('error', (error: any) => {
            console.error('WebSocket error:', error)
        })
    }

    async executeWithClaudeCode(message: string, options: { modelId?: string; streaming?: boolean; onStream?: (chunk: string) => void } = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.connected) {
                reject(new Error('Not connected to backend server. Make sure web-app server is running on port 3001.'))
                return
            }

            const messageData = {
                message,
                modelId: options.modelId || 'sonnet',
                sessionContinuity: true,
                streaming: options.streaming || false
            }

            let streamedContent = ''

            // Set up response listener
            const responseHandler = (response: any) => {
                this.socket?.off('response', responseHandler)
                this.socket?.off('error', errorHandler)
                this.socket?.off('stream', streamHandler)
                
                if (response.success) {
                    resolve({
                        success: true,
                        messages: response.messages || [{
                            content: response.content || streamedContent || 'No response content',
                            type: 'assistant_message',
                            timestamp: Date.now()
                        }]
                    })
                } else {
                    reject(new Error(response.error || 'Unknown error from backend'))
                }
            }

            const streamHandler = (data: any) => {
                streamedContent += data.chunk
                options.onStream?.(data.chunk)
            }

            const errorHandler = (error: any) => {
                this.socket?.off('response', responseHandler)
                this.socket?.off('error', errorHandler)
                this.socket?.off('stream', streamHandler)
                reject(new Error(error.error || 'WebSocket error'))
            }

            // Listen for response and streaming
            this.socket.on('response', responseHandler)
            this.socket.on('stream', streamHandler)
            this.socket.on('error', errorHandler)

            // Send message
            this.socket.emit('message', messageData)
        })
    }

    isConnected(): boolean {
        return this.connected
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
            this.connected = false
        }
    }
}

export type Message = {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: number
}

export type ChatPageState = {
    loadState: TaskState
    sendState: TaskState
    messages: Array<Message>
    currentInput: string
    errorMessage?: string
    isStreaming: boolean
    streamingContent: string
    selectedModel: string
    isConnected: boolean
    connectionStatus: string
    sidebarVisible: boolean
    currentConversationId: string | null
}

export type ChatStateDependencies = {
    services: Pick<FrontendServices, 'theme' | 'cache' | 'time'>
    redirect: (path: '/home') => void
}

export class ChatPageLogic extends Logic<
    ChatStateDependencies,
    ChatPageState
> {
    private sdk: ClaudeWebSocketClient

    constructor(deps: ChatStateDependencies) {
        super(deps)
        // Initialize real WebSocket client to existing backend
        this.sdk = new ClaudeWebSocketClient()
        console.log('✅ Claude Code SDK Demo ready')
    }

    getInitialState = (): ChatPageState => ({
        loadState: 'pristine',
        sendState: 'pristine',
        messages: [],
        currentInput: '',
        isStreaming: false,
        streamingContent: '',
        selectedModel: 'sonnet',
        isConnected: false,
        connectionStatus: 'Connecting...',
        sidebarVisible: false,
        currentConversationId: null
    })

    async initialize() {
        // Initialize with connection status
        await executeTask(this, 'loadState', async () => {
            this.updateConnectionStatus()
            
            // Check connection status periodically
            setInterval(() => {
                this.updateConnectionStatus()
            }, 2000)
                
            this.setState({ 
                messages: [
                    {
                        id: 'welcome',
                        content: `🎯 **Claude Code SDK Demo**\n\nThis uses the real claude-cc-sdk running on the backend server:\n\n• **Real Claude Code CLI**: Actual processing, not mocks\n• **WebSocket Integration**: Real-time communication\n• **Modern Architecture**: Clean frontend with Logic class pattern\n• **Production Ready**: Full error handling and state management\n\nSend a message to chat with the real Claude!`,
                        role: 'assistant',
                        timestamp: Date.now()
                    }
                ]
            })
        })
    }

    updateConnectionStatus = () => {
        const isConnected = this.sdk.isConnected()
        this.setState({
            isConnected,
            connectionStatus: isConnected ? 'Connected' : 'Disconnected'
        })
    }

    setCurrentInput = (input: string) => {
        this.setState({ currentInput: input })
    }

    setSelectedModel = (model: string) => {
        this.setState({ selectedModel: model })
    }

    sendMessage = async () => {
        const { currentInput } = this.state
        if (!currentInput.trim() || this.state.sendState === 'running') {
            return
        }

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            content: currentInput,
            role: 'user',
            timestamp: Date.now()
        }

        // Add user message and clear input
        this.setState({
            messages: [...this.state.messages, userMessage],
            currentInput: '',
            isStreaming: true,
            streamingContent: '',
            errorMessage: undefined
        })

        await executeTask(this, 'sendState', async () => {
            try {
                // Use claude-cc-sdk architecture pattern with streaming
                const result = await this.sdk.executeWithClaudeCode(currentInput, {
                    modelId: this.state.selectedModel,
                    streaming: true,
                    onStream: (chunk: string) => {
                        // Update streaming content in real-time
                        this.setState({
                            streamingContent: this.state.streamingContent + chunk
                        })
                    }
                })

                console.log('✅ Real Claude CC SDK response:', result)

                // Extract content using the same pattern as real SDK
                let assistantContent = 'No response received'
                
                if (result.success && result.messages && result.messages.length > 0) {
                    const lastMessage = result.messages[result.messages.length - 1]
                    assistantContent = lastMessage.content || this.state.streamingContent || 'No content in response'
                } else if (result.error) {
                    assistantContent = `Error: ${result.error}`
                }

                // Create final assistant message
                const assistantMessage: Message = {
                    id: `assistant-${Date.now()}`,
                    content: assistantContent,
                    role: 'assistant',
                    timestamp: Date.now()
                }

                this.setState({
                    messages: [...this.state.messages, assistantMessage],
                    isStreaming: false,
                    streamingContent: ''
                })

            } catch (error) {
                console.error('Error sending message:', error)
                this.setState({
                    errorMessage: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    isStreaming: false,
                    streamingContent: ''
                })
            }
        })
    }

    clearMessages = () => {
        this.setState({
            messages: [
                {
                    id: 'welcome',
                    content: 'Hello! I\'m Claude. How can I help you today?',
                    role: 'assistant',
                    timestamp: Date.now()
                }
            ]
        })
    }

    handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            this.sendMessage()
        }
    }

    // Sidebar methods
    toggleSidebar = () => {
        this.setState({ sidebarVisible: !this.state.sidebarVisible })
    }

    // Conversation management methods
    newConversation = () => {
        this.setState({
            messages: [{
                id: 'welcome',
                content: 'Hello! I\'m Claude. How can I help you today?',
                role: 'assistant',
                timestamp: Date.now()
            }],
            currentConversationId: null
        })
    }

    selectConversation = async (conversationId: string) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/conversations/${conversationId}`)
            const conversation = response.data
            
            // Convert conversation messages to our Message format
            const messages: Message[] = conversation.messages.map((msg: any) => ({
                id: msg.id,
                content: msg.content,
                role: msg.type === 'user' ? 'user' : 'assistant',
                timestamp: msg.timestamp
            }))

            this.setState({
                messages,
                currentConversationId: conversationId
            })
        } catch (error) {
            console.error('Failed to load conversation:', error)
            this.setState({
                errorMessage: 'Failed to load conversation'
            })
        }
    }

    deleteConversation = async (conversationId: string) => {
        try {
            await axios.delete(`http://localhost:3001/api/conversations/${conversationId}`)
            
            // If we deleted the current conversation, start a new one
            if (this.state.currentConversationId === conversationId) {
                this.newConversation()
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error)
            this.setState({
                errorMessage: 'Failed to delete conversation'
            })
        }
    }

    exportConversation = async (conversationId: string, format: 'json' | 'markdown' | 'api-json') => {
        try {
            const response = await axios.get(`http://localhost:3001/api/conversations/${conversationId}/export?format=${format}`, {
                responseType: 'text'
            })
            
            // Create a download link
            const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)
            const blob = new Blob([content], { 
                type: format === 'markdown' ? 'text/markdown' : 'application/json' 
            })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `conversation-${conversationId}.${format === 'api-json' || format === 'json' ? 'json' : 'md'}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to export conversation:', error)
            this.setState({
                errorMessage: 'Failed to export conversation'
            })
        }
    }

    useAsContext = async (conversationId: string) => {
        try {
            const response = await axios.post(`http://localhost:3001/api/conversations/${conversationId}/use-as-context`, {
                title: 'Context from conversation'
            })
            
            // Load the new conversation
            await this.selectConversation(response.data.id)
        } catch (error) {
            console.error('Failed to use conversation as context:', error)
            this.setState({
                errorMessage: 'Failed to use conversation as context'
            })
        }
    }

    // Cleanup method to disconnect WebSocket
    dispose() {
        this.sdk.disconnect()
    }
}