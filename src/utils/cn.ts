export function cn(...inputs: (string | boolean | undefined | null | number)[]): string {
  return inputs.filter(Boolean).join(' ')
}
