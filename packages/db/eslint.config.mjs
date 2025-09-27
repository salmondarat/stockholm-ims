import globals from "globals";
import { config as baseConfig } from "@repo/eslint-config/base";

export default [
  ...baseConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ["prisma/**/*.prisma", "dist/**"]
  }
];
