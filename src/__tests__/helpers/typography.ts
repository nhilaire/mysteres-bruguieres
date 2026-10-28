// French typography: a no-break space (U+00A0 or U+202F) before : ; ! ? and inside « », never an ordinary space.
const RULES: [RegExp, string][] = [
  [/ [:;!?]/g, 'ordinary space before punctuation'],
  [/« /g, 'ordinary space after «'],
  [/ »/g, 'ordinary space before »'],
];

export function frenchTypographyErrors(text: string): string[] {
  return RULES.flatMap(([pattern, message]) =>
    [...text.matchAll(pattern)].map((m) => `${message}: "…${text.slice(Math.max(0, m.index - 20), m.index + 3)}…"`),
  );
}
