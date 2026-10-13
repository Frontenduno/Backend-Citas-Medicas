/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  collectCoverageFrom: [
    "src/application/usecase/**/*.ts",
    "src/application/port/**/*.ts",
    "src/domain/repository/**/*.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};

module.exports = config;
