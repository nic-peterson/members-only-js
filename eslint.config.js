const globals = require("globals");
const js = require("@eslint/js");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    ignores: [
      "node_modules/",
      "dist/",
      "coverage/",
      "*.min.js",
      ".env",
      "*.log",
      "public/",
    ],
  },
];
