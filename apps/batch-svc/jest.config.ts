/* eslint-disable */
export default {
  displayName: "batch-svc",
  preset: "../../jest.preset.js",
  // setupFiles: ["dotenv/config", "../../.jest/jest.setup.js"],
  // setupFilesAfterEnv: ["<rootDir>/svc/test-setup.ts"],
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/apps/batch-svc",
  coveragePathIgnorePatterns: ["<rootDir>/main.ts", "<rootDir>/src/app", "<rootDir>/src/router/start-sync.ts"],
  coverageThreshold: {
    global: {
      statements: 98,
      branches: 95,
      functions: 98,
      lines: 98,
    },
  },
  collectCoverage: true,
};
