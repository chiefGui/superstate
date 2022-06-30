import { useEffect, useState } from 'react'

import { IDraft, ISuperState } from '@superstate/core'

/**
 * A React hook that re-renders the component when a superstate changes.
 *
 * @param ss - The `superstate` instance.
 * @param options.target - (default: `undefined`) The target to monitor. If not specified, whenever either `now` or `draft` changes, the component will re-render.
 *
 * @returns `null`
 */
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

    return () => unsubs.forEach((u) => u())
  }, [])

  return null
}

interface IUseSuperStateOptions {
  /**
   * The target to monitor. If not specified, whenever either `now` or `draft` changes, the component will re-render.
   */
  target: 'now' | 'draft'
}
