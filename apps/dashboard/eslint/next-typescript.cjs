const path = require("path");

module.exports = {
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: path.join(__dirname, "../tsconfig.json"),
        tsconfigRootDir: path.join(__dirname, ".."),
        sourceType: "module",
        warnOnUnsupportedTypeScriptVersion: true,
      },
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
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
  ],
};
