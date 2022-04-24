module.exports = {
  root: true,

  env: {
    node: true,
    es6: true,
    browser: true,
    "vue/setup-compiler-macros": true,
  },

  parser: "vue-eslint-parser",

  parserOptions: {
    ecmaVersion: 2022,
    parser: "@typescript-eslint/parser",
  },

  rules: {
    "no-unused-vars": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
  },

  plugins: ["@typescript-eslint"],

  extends: [
    "plugin:vue/vue3-essential",
    "@vue/standard",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
};
