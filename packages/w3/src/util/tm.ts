import { twMerge } from 'tailwind-merge'

export function tm(...classLists: (string | false)[]) {
  return twMerge(...classLists)
}
