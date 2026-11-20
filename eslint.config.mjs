import coreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * Flat ESLint config. `eslint-config-next` v16 already ships flat configs, so
 * no FlatCompat bridge is needed.
 */
const eslintConfig = [
  ...coreWebVitals,
  {
    // The public site ships pictures that are already cropped, sized and
    // converted to WebP by scripts/pictures.mjs, with explicit dimensions, so
    // it uses plain <img> (no optimiser, no extra client script).
    files: ["src/components/site/**", "src/app/(site)/**"],
    rules: { "@next/next/no-img-element": "off" },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      ".local-data/**",
      ".taste-skill/**",
      // The Godot web export: generated engine code, served as it is.
      "public/games/**",
    ],
  },
];

export default eslintConfig;
