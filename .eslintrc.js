module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jest/recommended",
    "plugin:jsx-a11y/strict",
    "plugin:promise/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:sonarjs/recommended",
    "prettier",
    "react-app",
    "react-app/jest",
  ],
  overrides: [
    {
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],

      files: ["*.ts", "*.tsx"],

      parserOptions: {
        project: ["./tsconfig.json"],
      },

      rules: {
        "@typescript-eslint/array-type": [
          "error",
          { default: "generic", readonly: "generic" },
        ],
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/no-redeclare": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            args: "none",
            ignoreRestSiblings: true,
          },
        ],
        "@typescript-eslint/prefer-nullish-coalescing": "error",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  plugins: [
    "deprecation",
    "escape",
    "import",
    "jest",
    "jsx-a11y",
    "no-null",
    "prefer-arrow",
    "promise",
    "react",
    "react-hooks",
    "sonarjs",
    "testing-library",
    "@typescript-eslint",
  ],
  rules: {
    "accessor-pairs": "error",
    "array-callback-return": "error",
    "arrow-body-style": "error",
    "class-methods-use-this": "error",
    complexity: "error",
    "consistent-return": "error",
    curly: ["error", "all"],
    "default-case": "error",
    "default-case-last": "error",
    eqeqeq: ["error", "always"],
    "escape/escape": ["error", "non-printable", { exact: true }],
    "grouped-accessor-pairs": ["error", "getBeforeSet"],
    "guard-for-in": "error",
    "import/named": "error",
    "import/newline-after-import": "error",
    "import/no-default-export": "error",
    "import/no-named-as-default-member": "error",
    "import/no-named-default": "error",
    "import/no-unassigned-import": [
      "error",
      { allow: ["**/*.css", "**/*.scss"] },
    ],
    "import/no-unused-modules": ["warn", { unusedExports: true }],
    "import/order": [
      "error",
      {
        alphabetize: { caseInsensitive: true, order: "asc" },
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type",
        ],
        warnOnUnassignedImports: true,
      },
    ],
    "jest/expect-expect": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/aria-activedescendant-has-tabindex": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/iframe-has-title": "error",
    "jsx-a11y/img-redundant-alt": "error",
    "jsx-a11y/no-access-key": "error",
    "jsx-a11y/no-distracting-elements": "error",
    "jsx-a11y/no-redundant-roles": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",
    "jsx-a11y/scope": "error",
    "max-classes-per-file": [
      "error",
      {
        ignoreExpressions: true,
        max: 1,
      },
    ],
    "max-lines": ["error", 300],
    "no-alert": "error",
    "no-await-in-loop": "error",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-cond-assign": ["error", "always"],
    "no-console": "error",
    "no-constructor-return": "error",
    "no-div-regex": "error",
    "no-duplicate-case": "error",
    "no-else-return": "error",
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-fallthrough": "error",
    "no-implicit-coercion": ["error", { boolean: false }],
    "no-invalid-this": "error",
    "no-irregular-whitespace": ["error", { skipStrings: false }],
    "no-iterator": "error",
    "no-labels": ["error", { allowLoop: false, allowSwitch: false }],
    "no-lone-blocks": "error",
    "no-lonely-if": "error",
    "no-multi-assign": "error",
    "no-multi-str": "error",
    "no-negated-condition": "error",
    "no-new": "error",
    "no-new-func": "error",
    "no-new-object": "error",
    "no-new-wrappers": "error",
    "no-null/no-null": "error",
    "no-octal-escape": "error",
    "no-param-reassign": "error",
    "no-promise-executor-return": "error",
    "no-proto": "error",
    "no-restricted-globals": ["error", "_", "$", "escape", "event", "unescape"],
    "no-restricted-syntax": ["error", "WithStatement"],
    "no-return-assign": ["error", "always"],
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": ["error", { allowInParentheses: false }],
    "no-tabs": "error",
    "no-template-curly-in-string": "error",
    "no-undef-init": "error",
    "no-unmodified-loop-condition": "error",
    "no-unneeded-ternary": "error",
    "no-unreachable-loop": "error",
    "no-useless-call": "error",
    "no-useless-computed-key": "error",
    "no-useless-concat": "error",
    "no-useless-rename": "error",
    "no-useless-return": "error",
    "no-void": "error",
    "no-warning-comments": ["error", { location: "anywhere" }],
    "no-with": "error",
    "object-shorthand": "error",
    "one-var": ["error", "never"],
    "operator-assignment": "error",
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", next: "return", prev: "*" },
    ],
    "prefer-arrow/prefer-arrow-functions": "error",
    "prefer-destructuring": "error",
    "prefer-exponentiation-operator": "error",
    "prefer-numeric-literals": "error",
    "prefer-object-spread": "error",
    "prefer-promise-reject-errors": "error",
    "prefer-regex-literals": "error",
    "prefer-template": "error",
    "promise/catch-or-return": ["error", { allowFinally: true }],
    "promise/no-callback-in-promise": "error",
    "promise/no-nesting": "error",
    "promise/no-promise-in-callback": "error",
    "promise/no-return-in-finally": "error",
    "promise/valid-params": "error",
    "quote-props": ["error", "as-needed"],
    quotes: ["error", "double", { avoidEscape: true }],
    radix: "error",
    "react/react-in-jsx-scope": "off",
    "require-atomic-updates": "error",
    "require-unicode-regexp": "error",
    "sonarjs/no-identical-conditions": "off", // see "no-dupe-else-if"
    "sonarjs/no-inverted-boolean-check": "error",
    "sonarjs/no-one-iteration-loop": "off", // see "no-unreachable-loop"
    "sonarjs/no-useless-catch": "off", // see "no-useless-catch"
    "sonarjs/prefer-single-boolean-return": "off", // see "no-else-return"
    "sort-keys": ["error", "asc", { caseSensitive: false, natural: true }],
    "spaced-comment": [
      "error",
      "always",
      { block: { balanced: true }, markers: ["!", "/"] },
    ],
    "symbol-description": "error",
    "unicode-bom": "error",
    yoda: ["error", "never"],
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
};
