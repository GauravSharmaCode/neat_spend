import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node, // Use Node.js globals for a backend service
        ...globals.jest, // Add Jest globals for test files
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    // You can add custom rules here if needed
    // rules: {
    //   "no-unused-vars": "warn"
    // }
  },
];
