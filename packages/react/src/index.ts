import { useEffect, useState } from 'react'

import { IDraft, ISuperState } from '@superstate/core'

export function useSuperState<S>(
  ss: ISuperState<S>,
  options: IUseSuperStateOptions = { target: 'both' }
) {
  const [, setNow] = useState<S>(ss.now())
  const [, setDraft] = useState<IDraft<S>>(ss.draft())

  useEffect((): (() => void) => {
    const unsubs: (() => void)[] = []

    if (options.target === 'both' || options.target === 'now') {
      unsubs.push(ss.subscribe(setNow))
    }

    if (options.target === 'both' || options.target === 'draft') {
      unsubs.push(ss.subscribeDraft(setDraft))
    }

    return () => {
      unsubs.forEach((u) => u())
    }
  }, [])

  return null
}

interface IUseSuperStateOptions {
  target: 'now' | 'draft' | 'both'
}
