module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:react/recommended"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react"],
  rules: {
    "max-len": [
      "error",
      {
        code: 120,
        ignoreUrls: true,
        ignorePattern: "^ */([^/]|\\/)*/i?[)]*[;,]?$",
        tabWidth: 2,
      },
    ],
    "no-tabs": "error",
    "no-trailing-spaces": "error",
    semi: "error",
    "semi-spacing": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
