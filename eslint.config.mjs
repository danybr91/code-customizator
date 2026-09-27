import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["out/**", "scripts/**", "node_modules/**", "**/*.vsix"]
    },
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off"
        }
    }
);
