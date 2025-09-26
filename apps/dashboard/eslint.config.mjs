import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";
import { nextJsConfig } from "@repo/eslint-config/next-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: config.files ?? ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
}));

export default [
  ...nextJsConfig,
  ...typeCheckedConfigs,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];
