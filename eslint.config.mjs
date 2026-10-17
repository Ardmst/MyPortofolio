import coreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * Flat ESLint config. `eslint-config-next` v16 already ships flat configs, so
 * no FlatCompat/@eslint/eslintrc bridge is needed.
 */
const eslintConfig = [
  ...coreWebVitals,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", ".local-data/**"],
  },
];

export default eslintConfig;
