import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
  ...nextVitals,
  {
    files: ["components/ui/**/*.{ts,tsx}"],
    rules: {
      // shadcn/ui patterns (carousel init, skeleton random width)
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
  eslintConfigPrettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);
