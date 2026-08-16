module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/index.js",
    "!src/server.js"
  ],
  coverageDirectory: "coverage",
  setupFiles: ["./src/tests/setup.js"],
};