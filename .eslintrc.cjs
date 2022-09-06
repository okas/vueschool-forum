module.exports = {
  root: true,

  env: {
    node: true,
    es2022: true,
    browser: true,
  },

  parser: "vue-eslint-parser",

  // https://github.com/vuejs/vue-eslint-parser#parseroptionsparser
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2022,
    sourceType: "module",
  },

  plugins: ["@typescript-eslint"],

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "prettier",
  ],

  overrides: [
    {
      files: ["*.html"],
      rules: {
        "vue/comment-directive": "off",
      },
    },
  ],
};
