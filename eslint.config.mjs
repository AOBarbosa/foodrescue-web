import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tailwind from 'eslint-plugin-tailwindcss'

export default defineConfig([
  // Next (core web vitals + typescript-eslint, already registers the
  // `@typescript-eslint` plugin and parser for .ts/.tsx).
  ...nextVitals,
  ...nextTs,

  tailwind.configs.recommended,

  {
    settings: {
      tailwindcss: {
        // Tailwind v4: the CSS entry point replaces tailwind.config.js.
        cssConfigPath: './app/globals.css',
        functions: ['classNames', 'clsx', 'cn', 'cva'],
      },
    },

    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/incompatible-library': 'off',

      /* TypeScript */
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-namespace': 'off',

      /* JS */
      'no-case-declarations': 'off',
      camelcase: 'off',

      /* Console */
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      /* Tailwind: class order is handled by prettier-plugin-tailwindcss. */
      'tailwindcss/classnames-order': 'off',

      /* Import sort */
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // react, next and packages (scoped packages like @mui/* included)
            ['^react$', '^next', '^@?\\w'],
            // internal alias (tsconfig "@/*")
            ['^@/'],
            // parent imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // sibling imports
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // styles
            ['^.+\\.s?css$'],
            // side effect imports
            ['^\\u0000'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  // Must stay last: turns off stylistic rules that conflict with Prettier
  // (eslint-config-prettier) and reports formatting as `prettier/prettier`.
  prettierRecommended,

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
