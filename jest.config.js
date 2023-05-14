const jestConfig = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  transform: {}
}

export default jestConfig
