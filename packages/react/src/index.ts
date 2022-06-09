import { useEffect, useState } from 'react'

import { IDraft, ISuperState } from '@superstate/core'

export function useSuperState<S>(
  ss: Pick<ISuperState<S>, 'subscribe' | 'now' | 'draft'>,
  options?: IUseSuperStateOptions
) {
  const [, setNow] = useState<S>(ss.now())
  const [, setDraft] = useState<IDraft<S>>(ss.draft())

  useEffect((): (() => void) => {
    const unsubs: (() => void)[] = []

    if (!options?.target || options.target === 'now') {
      unsubs.push(ss.subscribe(setNow))
    }

    if (!options?.target || options.target === 'draft') {
      unsubs.push(ss.subscribe(setDraft, 'draft'))
    }

    return () => {
      unsubs.forEach((u) => u())
    }
  }, [])

  return null
}

interface IUseSuperStateOptions {
  target: 'now' | 'draft'
}
