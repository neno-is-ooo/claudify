/**
 * Basic Chat Example
 * 
 * Simple terminal chat interface using Claude Code SDK
 * Demonstrates basic SDK usage without web interface
 */

import { ClaudeCodeSDK } from '@claude-cc/sdk'
import readline from 'readline'

// Initialize SDK
const sdk = new ClaudeCodeSDK({
  debug: false // Set to true for debugging
})

// Create readline interface for terminal input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Chat state
let sessionId = null
let messageCount = 0

// Colors for terminal output
const colors = {
  user: '\x1b[36m',     // Cyan
  assistant: '\x1b[32m', // Green
  error: '\x1b[31m',    // Red
  info: '\x1b[33m',     // Yellow
  reset: '\x1b[0m'      // Reset
}

// Print welcome message
console.log(`${colors.info}🤖 Claude Code Chat - Basic Example${colors.reset}`)
console.log(`${colors.info}Type 'exit' to quit, 'clear' to clear history${colors.reset}`)
console.log(`${colors.info}Model: Sonnet (change with '/opus' or '/sonnet')${colors.reset}`)
console.log('')

// Current model
let currentModel = 'sonnet'

// Main chat loop
async function chat() {
  rl.question(`${colors.user}You: ${colors.reset}`, async (input) => {
    // Handle special commands
    if (input.toLowerCase() === 'exit') {
      console.log(`${colors.info}Goodbye!${colors.reset}`)
      rl.close()
      process.exit(0)
    }

    if (input.toLowerCase() === 'clear') {
      console.clear()
      sessionId = null
      messageCount = 0
      console.log(`${colors.info}Chat history cleared${colors.reset}`)
      chat()
      return
    }

    if (input.startsWith('/')) {
      handleCommand(input)
      chat()
      return
    }

    // Send message to Claude
    try {
      console.log(`${colors.assistant}Claude: ${colors.reset}`, end='')
      
      messageCount++
      
      // Use streaming for better UX
      let fullResponse = ''
      for await (const chunk of sdk.executeStreamingWithClaudeCode(input, {
        modelId: currentModel,
        continueSession: sessionId !== null,
        sessionId: sessionId || `chat-${Date.now()}`
      })) {
        process.stdout.write(chunk)
        fullResponse += chunk
      }
      
      // Set session ID for continuity
      if (!sessionId) {
        sessionId = `chat-${Date.now()}`
      }
      
      console.log('\n')
      
    } catch (error) {
      console.error(`${colors.error}Error: ${error.message}${colors.reset}`)
      
      if (error.code === 'CLI_NOT_FOUND') {
        console.log(`${colors.info}Please install Claude Code CLI: https://claude.ai/code${colors.reset}`)
      } else if (error.code === 'NOT_AUTHENTICATED') {
        console.log(`${colors.info}Please login: claude code login${colors.reset}`)
      }
    }
    
    // Continue chat loop
    chat()
  })
}

// Handle special commands
function handleCommand(command) {
  switch (command.toLowerCase()) {
    case '/opus':
      currentModel = 'opus'
      console.log(`${colors.info}Switched to Opus model${colors.reset}`)
      break
    case '/sonnet':
      currentModel = 'sonnet'
      console.log(`${colors.info}Switched to Sonnet model${colors.reset}`)
      break
    case '/help':
      showHelp()
      break
    case '/status':
      showStatus()
      break
    default:
      console.log(`${colors.error}Unknown command: ${command}${colors.reset}`)
      console.log(`${colors.info}Type /help for available commands${colors.reset}`)
  }
}

// Show help
function showHelp() {
  console.log(`${colors.info}
Available commands:
  /opus     - Switch to Opus model (more powerful)
  /sonnet   - Switch to Sonnet model (faster)
  /status   - Show current session status
  /help     - Show this help message
  clear     - Clear chat history
  exit      - Exit the chat
${colors.reset}`)
}

// Show status
function showStatus() {
  console.log(`${colors.info}
Session Status:
  Model: ${currentModel}
  Session ID: ${sessionId || 'None'}
  Messages: ${messageCount}
${colors.reset}`)
}

// Utility to print without newline
function print(text, end = '\n') {
  process.stdout.write(text + end)
}

// Start chat
chat()

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n${colors.info}Goodbye!${colors.reset}`)
  rl.close()
  process.exit(0)
})