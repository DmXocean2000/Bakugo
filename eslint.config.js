module.exports = [
  {
    ignores: ["node_modules/**"]
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        global: "readonly"
      }
    },
    rules: {
      "spaced-comment": "off",
      "capitalized-comments": "off",
      "multiline-comment-style": "off",
      "no-inline-comments": "off",
      "no-warning-comments": "off",
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  }
];