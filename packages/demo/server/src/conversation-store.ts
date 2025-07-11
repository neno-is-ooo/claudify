import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant' | 'error' | 'system';
  content: string;
  timestamp: number;
  duration?: number;
  modelId?: string;
  // Raw API call data
  rawExecutionResult?: any;
  apiCallData?: {
    request: any;
    response: any;
    metadata: any;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
  modelId?: string;
  // Context data for conversation continuation
  contextData?: {
    totalTokens?: number;
    sessionContext?: any;
    lastModelUsed?: string;
  };
}

export class ConversationStore {
  private conversations: Map<string, Conversation> = new Map();
  private storageDir: string;

  constructor(storageDir: string = './conversations') {
    this.storageDir = storageDir;
    this.ensureStorageDir();
    this.loadConversations();
  }

  private async ensureStorageDir() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
    }
  }

  private async loadConversations() {
    try {
      const files = await fs.readdir(this.storageDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      for (const file of jsonFiles) {
        try {
          const data = await fs.readFile(path.join(this.storageDir, file), 'utf-8');
          const conversation = JSON.parse(data) as Conversation;
          this.conversations.set(conversation.id, conversation);
        } catch (error) {
          console.error(`Failed to load conversation ${file}:`, error);
        }
      }
      
      console.log(`Loaded ${this.conversations.size} conversations`);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  async createConversation(title?: string): Promise<Conversation> {
    const conversation: Conversation = {
      id: uuidv4(),
      title: title || `Conversation ${new Date().toLocaleString()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.conversations.set(conversation.id, conversation);
    await this.saveConversation(conversation);
    return conversation;
  }

  async addMessage(conversationId: string, message: ConversationMessage): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    conversation.messages.push(message);
    conversation.updatedAt = Date.now();
    
    // Auto-generate title from first user message if not set
    if (conversation.title.startsWith('Conversation ') && 
        message.type === 'user' && 
        conversation.messages.filter(m => m.type === 'user').length === 1) {
      conversation.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
    }

    await this.saveConversation(conversation);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async getAllConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async deleteConversation(id: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (!conversation) return;

    this.conversations.delete(id);
    try {
      await fs.unlink(path.join(this.storageDir, `${id}.json`));
    } catch (error) {
      console.error(`Failed to delete conversation file ${id}:`, error);
    }
  }

  async exportConversation(id: string, format: 'json' | 'markdown' | 'api-json' = 'json'): Promise<string> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error(`Conversation ${id} not found`);
    }

    if (format === 'json') {
      return JSON.stringify(conversation, null, 2);
    }

    if (format === 'api-json') {
      // Export complete API call data including raw execution results
      const apiData = {
        conversation: conversation,
        apiCalls: conversation.messages.map(msg => ({
          messageId: msg.id,
          timestamp: msg.timestamp,
          type: msg.type,
          content: msg.content,
          modelId: msg.modelId,
          duration: msg.duration,
          rawExecutionResult: msg.rawExecutionResult,
          apiCallData: msg.apiCallData
        })).filter(call => call.rawExecutionResult || call.apiCallData),
        exportedAt: Date.now(),
        format: 'complete-api-data'
      };
      return JSON.stringify(apiData, null, 2);
    }

    // Markdown format
    let markdown = `# ${conversation.title}\n\n`;
    markdown += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`;
    markdown += `Last Updated: ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;
    markdown += `---\n\n`;

    for (const message of conversation.messages) {
      const timestamp = new Date(message.timestamp).toLocaleTimeString();
      const role = message.type === 'user' ? '👤 You' : 
                   message.type === 'assistant' ? '🤖 Claude' : 
                   message.type === 'system' ? '💻 System' : '❌ Error';
      
      markdown += `### ${role} [${timestamp}]`;
      if (message.modelId) {
        markdown += ` (${message.modelId})`;
      }
      if (message.duration) {
        markdown += ` - ${message.duration}ms`;
      }
      markdown += `\n\n${message.content}\n\n`;
    }

    return markdown;
  }

  async searchConversations(query: string): Promise<Conversation[]> {
    const results: Conversation[] = [];
    const lowerQuery = query.toLowerCase();

    for (const conversation of this.conversations.values()) {
      // Search in title
      if (conversation.title.toLowerCase().includes(lowerQuery)) {
        results.push(conversation);
        continue;
      }

      // Search in messages
      const hasMatch = conversation.messages.some(msg => 
        msg.content.toLowerCase().includes(lowerQuery)
      );

      if (hasMatch) {
        results.push(conversation);
      }
    }

    return results.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async createConversationFromContext(title: string, contextConversationId: string): Promise<Conversation> {
    const sourceConversation = await this.getConversation(contextConversationId);
    if (!sourceConversation) {
      throw new Error(`Source conversation ${contextConversationId} not found`);
    }

    const newConversation: Conversation = {
      id: uuidv4(),
      title: title || `Context from: ${sourceConversation.title}`,
      messages: [...sourceConversation.messages], // Copy all messages as context
      createdAt: Date.now(),
      updatedAt: Date.now(),
      contextData: {
        totalTokens: sourceConversation.messages.length,
        sessionContext: sourceConversation.contextData,
        lastModelUsed: sourceConversation.modelId || sourceConversation.messages[sourceConversation.messages.length - 1]?.modelId
      }
    };

    this.conversations.set(newConversation.id, newConversation);
    await this.saveConversation(newConversation);
    return newConversation;
  }

  async updateMessageWithApiData(conversationId: string, messageId: string, apiData: any): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const message = conversation.messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error(`Message ${messageId} not found`);
    }

    message.rawExecutionResult = apiData.rawResult;
    message.apiCallData = {
      request: apiData.request,
      response: apiData.response,
      metadata: apiData.metadata
    };

    await this.saveConversation(conversation);
  }

  private async saveConversation(conversation: Conversation): Promise<void> {
    try {
      const filePath = path.join(this.storageDir, `${conversation.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(conversation, null, 2));
    } catch (error) {
      console.error(`Failed to save conversation ${conversation.id}:`, error);
    }
  }
}