module.exports = {
	testEnvironment: "jsdom",
	transform: {
		"^.+\\.(js|jsx|mjs)$": "babel-jest",
	},
	setupFilesAfterEnv: ["@testing-library/jest-dom"],
	moduleFileExtensions: ["js", "jsx", "mjs", "json"],
	testMatch: ["**/__tests__/**/*.test.{js,jsx,mjs}"],
	transformIgnorePatterns: ["/node_modules/(?!(jest-)?@testing-library)"],
};
