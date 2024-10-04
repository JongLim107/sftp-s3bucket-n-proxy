const nxPreset = require("@nx/jest/preset").default;

module.exports = {
  ...nxPreset,
  // set in each svc respectively to have the converage report for each service
  setupFiles: ["dotenv/config", "./.jest/jest.setup.js", "./.jest/set-env-vars.js"],
  // testMatch: ["**/+(*.)+(spec|test).+(ts|js)?(x)"],
  // transform: {
  //   "^.+\\.(ts|js|html)$": "ts-jest",
  // },
  // resolver: "@nx/jest/plugins/resolver",
  // moduleFileExtensions: ["ts", "js", "html"],
  // coverageReporters: ["html"],
};
