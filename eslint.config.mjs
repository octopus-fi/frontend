import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const compat = new FlatCompat();

const eslintConfig = defineConfig([
  // Wrap legacy configs for Flat Config compatibility
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
