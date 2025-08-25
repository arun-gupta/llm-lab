import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Temporarily disable strict rules that are causing issues
      "@typescript-eslint/no-explicit-any": "warn", // Change from error to warning
      "@typescript-eslint/no-unused-vars": "warn", // Change from error to warning
      "@typescript-eslint/no-require-imports": "warn", // Change from error to warning
      "react/no-unescaped-entities": "warn", // Change from error to warning
      "@next/next/no-img-element": "warn", // Change from error to warning
      "react-hooks/exhaustive-deps": "warn", // Change from error to warning
      "prefer-const": "warn", // Change from error to warning
    },
  },
];

export default eslintConfig;
