// The options both formatters share, so oxfmt and Prettier format a file the same way.
export const options = {
  semi: false,
  singleQuote: true,
  // oxfmt's default, written out because Prettier's is 80
  printWidth: 100,
} as const
