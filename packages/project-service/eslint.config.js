// @ts-check
/* eslint-disable @typescript-eslint/no-require-imports */

const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
    ...tseslint.configs.recommended,
    {
        ignores: ["dist/**", "node_modules/**"],
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "warn"
        }
    }
);
