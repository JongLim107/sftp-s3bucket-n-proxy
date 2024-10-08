export default {
  displayName: "auth-svc",
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
  coverageDirectory: "../../coverage/apps/auth-svc",
  coveragePathIgnorePatterns: [
    "<rootDir>/src/main.ts",
    "<rootDir>/src/service/kms-auth.ts",
    "<rootDir>/src/router/update-pass.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 98,
      branches: 98,
      functions: 98,
      lines: 98,
    },
  },
  collectCoverage: true,
  detectOpenHandles: true,
};
