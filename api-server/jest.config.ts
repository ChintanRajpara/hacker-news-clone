import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": ["ts-jest", {}], // This replaces the deprecated "globals" config
  },
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["ts", "js"],
};

export default config;
