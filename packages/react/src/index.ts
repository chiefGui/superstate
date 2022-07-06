import { useEffect, useState } from 'react'

import { ISuperState } from '@superstate/core'

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
  const [, setNow] = useState(_getRandomDateForChecksum())
  const [, setDraft] = useState(_getRandomDateForChecksum())

  function _rerender(target?: ISuperstateTarget) {
    switch (target) {
      case 'now':
        setNow(_getRandomDateForChecksum())
        break
      case 'draft':
        setDraft(_getRandomDateForChecksum())
        break
      default:
        setNow(_getRandomDateForChecksum())
        setDraft(_getRandomDateForChecksum())
    }
  }

  useEffect((): (() => void) => {
    const unsubs: (() => void)[] = []

    if (!options?.target || options.target === 'now') {
      unsubs.push(ss.subscribe(() => _rerender('now')))
    }

    if (!options?.target || options.target === 'draft') {
      unsubs.push(ss.subscribe(() => _rerender('draft')))
    }

    return () => unsubs.forEach((u) => u())
  }, [])

  return null
}

interface IUseSuperStateOptions {
  /**
   * The target to monitor. If not specified, whenever either `now` or `draft` changes, the component will re-render.
   */
  target: ISuperstateTarget
}

type ISuperstateTarget = 'now' | 'draft'

function _getRandomDateForChecksum() {
  return new Date(Math.floor(Math.random() * 10000000000))
}
