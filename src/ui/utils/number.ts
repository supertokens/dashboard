/**
 * Get Ordinal text from number 
 ** 1 -> st
 ** 2 -> nd
 ** 3 -> rd
 ** 4 -> th
 */
export const ordinal = (num: number) => {
  const mod = num % 10
  const modMap: Record<number, string> = {1: 'st',2: 'nd',3: 'rd'}
  return num >10 && num < 14 ? 'th' : (modMap[mod] ?? 'th')
}
