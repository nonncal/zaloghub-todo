const rules = new Intl.PluralRules('ru-RU')

/** plural(3, ['задача', 'задачи', 'задач']) → «задачи» */
export function plural(n: number, [one, few, many]: [string, string, string]): string {
  const form = rules.select(n)
  if (form === 'one') return one
  if (form === 'few') return few
  return many
}
