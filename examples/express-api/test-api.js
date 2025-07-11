/**
 * API Test Script
 * 
 * Tests the Express API endpoints
 */

import axios from 'axios'

const API_URL = 'http://localhost:3000'

// Colors for output
const colors = {
  success: '\x1b[32m✓\x1b[0m',
  error: '\x1b[31m✗\x1b[0m',
  info: '\x1b[36m',
  reset: '\x1b[0m'
}

// Test results
let passed = 0
let failed = 0

// Test helper
async function test(name, fn) {
  try {
    await fn()
    console.log(`${colors.success} ${name}`)
    passed++
  } catch (error) {
    console.log(`${colors.error} ${name}`)
    console.log(`  ${colors.error} ${error.message}${colors.reset}`)
    failed++
  }
}

// Assert helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

// Run tests
async function runTests() {
  console.log(`${colors.info}Running API tests...${colors.reset}\n`)

  // Test health endpoint
  await test('GET /health', async () => {
    const res = await axios.get(`${API_URL}/health`)
    assert(res.status === 200, 'Status should be 200')
    assert(res.data.status === 'healthy', 'Should return healthy status')
  })

  // Test models endpoint
  await test('GET /api/models', async () => {
    const res = await axios.get(`${API_URL}/api/models`)
    assert(res.status === 200, 'Status should be 200')
    assert(Array.isArray(res.data.models), 'Should return models array')
    assert(res.data.models.length === 2, 'Should have 2 models')
  })

  // Test execute endpoint
  await test('POST /api/execute - basic', async () => {
    const res = await axios.post(`${API_URL}/api/execute`, {
      prompt: 'Say "Hello API test"',
      model: 'sonnet'
    })
    assert(res.status === 200, 'Status should be 200')
    assert(res.data.success === true, 'Should be successful')
    assert(res.data.response, 'Should have response content')
  })

  // Test missing prompt
  await test('POST /api/execute - missing prompt', async () => {
    try {
      await axios.post(`${API_URL}/api/execute`, {})
      throw new Error('Should have failed')
    } catch (error) {
      assert(error.response.status === 400, 'Status should be 400')
      assert(error.response.data.code === 'MISSING_PROMPT', 'Should return correct error code')
    }
  })

  // Test invalid model
  await test('POST /api/execute - invalid model', async () => {
    try {
      await axios.post(`${API_URL}/api/execute`, {
        prompt: 'Test',
        model: 'invalid'
      })
      throw new Error('Should have failed')
    } catch (error) {
      assert(error.response.status === 400, 'Status should be 400')
      assert(error.response.data.code === 'INVALID_MODEL', 'Should return correct error code')
    }
  })

  // Test batch execution
  await test('POST /api/execute/batch', async () => {
    const res = await axios.post(`${API_URL}/api/execute/batch`, {
      prompts: ['Test 1', 'Test 2'],
      model: 'sonnet'
    })
    assert(res.status === 200, 'Status should be 200')
    assert(res.data.success === true, 'Should be successful')
    assert(res.data.results.length === 2, 'Should have 2 results')
  })

  // Test empty batch
  await test('POST /api/execute/batch - empty array', async () => {
    try {
      await axios.post(`${API_URL}/api/execute/batch`, {
        prompts: []
      })
      throw new Error('Should have failed')
    } catch (error) {
      assert(error.response.status === 400, 'Status should be 400')
      assert(error.response.data.code === 'MISSING_PROMPTS', 'Should return correct error code')
    }
  })

  // Test 404
  await test('GET /invalid - 404', async () => {
    try {
      await axios.get(`${API_URL}/invalid`)
      throw new Error('Should have failed')
    } catch (error) {
      assert(error.response.status === 404, 'Status should be 404')
      assert(error.response.data.code === 'NOT_FOUND', 'Should return correct error code')
    }
  })

  // Summary
  console.log(`\n${colors.info}Test Results:${colors.reset}`)
  console.log(`${colors.success} Passed: ${passed}`)
  if (failed > 0) {
    console.log(`${colors.error} Failed: ${failed}`)
    process.exit(1)
  } else {
    console.log(`${colors.info}All tests passed!${colors.reset}`)
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_URL}/health`)
    return true
  } catch (error) {
    return false
  }
}

// Main
async function main() {
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    console.log(`${colors.error}Server not running at ${API_URL}`)
    console.log(`${colors.info}Start the server with: npm start${colors.reset}`)
    process.exit(1)
  }

  await runTests()
}

main().catch(console.error)