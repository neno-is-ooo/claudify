/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use Node environment instead of JSDOM
  testEnvironment: 'node',
  
  // Use ts-jest for TypeScript files
  preset: 'ts-jest',
  
  // Handle TypeScript and JavaScript files
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        // Use ESM modules
        useESM: true,
      }
    ],
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // Support ESM modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Keep path aliases
  moduleNameMapper: {
    // Handle @ alias for src directory
    '^@/(.*)$': '<rootDir>/src/$1',
    // Map the @backend alias to the actual backend directory
    '^@backend/(.*)$': '<rootDir>/../backend/$1',
    // Map @babel/runtime imports in backend files to the frontend node_modules
    '^@babel/runtime/(.*)$': '<rootDir>/node_modules/@babel/runtime/$1',
    // Handle ESM imports
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  
  // Standard configuration for a web project
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  
  // Add coverage reporting
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ]
};