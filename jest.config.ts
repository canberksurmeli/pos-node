import type { Config } from "@jest/types";
// Sync object
const config: Config.InitialOptions = {
	verbose: true,
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	moduleDirectories: ["node_modules"],
	resolver: "jest-ts-webcompat-resolver",
};
export default config;
