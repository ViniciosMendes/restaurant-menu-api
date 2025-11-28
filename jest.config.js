const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: 'ts-jest',
  testMatch: ["**/tests/**/*.test.ts"],
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts",
                        "!src/migrations/**",
                        "!src/tests/**",
                        "!src/index.ts",
                        "!src/data-source.ts",
                        "!src/swagger.ts",
                        "!src/*.ts"],
  coverageReporters: ["text", "lcov", "html"],
  transform: {
    ...tsJestTransformCfg,
  },
};