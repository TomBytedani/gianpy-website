import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Custom ignores
    ".beads/**",
    "docs/**",
  ]),
  {
    // Prettier compatibility - ESLint handles code quality, Prettier handles formatting
    rules: {
      // Disable formatting rules that conflict with Prettier
      "indent": "off",
      "linebreak-style": "off",
      "quotes": "off",
      "semi": "off",
    },
  },
]);

export default eslintConfig;
