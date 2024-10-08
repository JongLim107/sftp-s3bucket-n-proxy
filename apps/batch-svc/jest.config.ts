/* eslint-disable */
export default {
  displayName: "batch-svc",
  // preset: "../../jest.preset.js",
  setupFiles: ["../../.jest/set-env-vars.js"],
  setupFilesAfterEnv: ["dotenv/config", "../../.jest/jest.setup.js", "../../.jest/setup-redis-mock.js"],
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  moduleNameMapper: {
    "^@sftp-s3bucket-n-proxy/shared$": "<rootDir>/../../libs/shared/src/index.ts",
  },
  coverageDirectory: "../../coverage/apps/batch-svc",
  coveragePathIgnorePatterns: ["<rootDir>/src/main.ts", "<rootDir>/src/app", "<rootDir>/src/router/start-sync.ts"],
  coverageThreshold: {
    global: {
      statements: 98,
      branches: 98,
      functions: 98,
      lines: 98,
    },
  },
  collectCoverage: true,
};
