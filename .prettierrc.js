module.exports = {
  // Standard Prettier options (customize as needed)
  semi: true,
  tabWidth: 2,
  printWidth: 80,
  singleQuote: true,
  trailingComma: 'es5',
  jsxSingleQuote: false,
  bracketSpacing: true,
  arrowParens: 'always',

  // Plugin configuration
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  // Options for the import sort plugin
  importOrder: [
    '^react(?:$|/)',
    '^next(?:$|/)',
    '<THIRD_PARTY_MODULES>', // Third-party modules (this is a special string)
    '',
    '^@/(.*)$', // Internal aliases (@/components, @/lib, etc.)
    '',
    '^[./]', // Relative imports
    '',
    '<TYPES>',
  ],
  importOrderParserPlugins: ['typescript', 'jsx'],
  importOrderTypeScriptVersion: '5.0.0', // Specify TS version used in project
};
