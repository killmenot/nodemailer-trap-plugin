import js from "@eslint/js";
import globals from "globals";
import mochaPlugin from "eslint-plugin-mocha";
import { defineConfig } from "eslint/config";

export default defineConfig([
  mochaPlugin.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      "space-before-function-paren": ["error", {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
      }],
      semi: ["error", "always"],
    },
  },
  {
    files: ["lib/*.js", "test/*.js", 'index.js'],
    languageOptions: {
      sourceType: "commonjs"
    },
  },
]);
