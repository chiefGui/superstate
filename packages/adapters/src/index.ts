import { IMiddlewareInput } from '@superstate/core'

const LS_DRAFT_SUFFIX = '__draft'

/**
 * superstate's localStorage adapter. A middleware
 * to automatically load from/write to localStorage.
 *
 * @param key The `localStorage` key to save to.
 */
export function ls<S = any>(key: string, options?: ILSOptions) {
  return ({ eventType, now, set, sketch, draft }: IMiddlewareInput<S>) => {
    if (eventType === 'init') {
      const foundNowAtLocalStorage = localStorage.getItem(key)

      if (!foundNowAtLocalStorage) {
        return
      }

      set(JSON.parse(foundNowAtLocalStorage))

      if (options?.draft) {
        const foundDraftAtLocalStorage = localStorage.getItem(
          `${key}${LS_DRAFT_SUFFIX}`
        )

        if (!foundDraftAtLocalStorage) {
          return
        }

        sketch(JSON.parse(foundDraftAtLocalStorage))
      }

      return
    }

    if (eventType === 'after:change') {
      localStorage.setItem(key, JSON.stringify(now()))
    }

    if (options?.draft && eventType === 'after:sketch') {
      localStorage.setItem(`${key}${LS_DRAFT_SUFFIX}`, JSON.stringify(draft()))
    }

    if (options?.draft && eventType === 'after:discard') {
      localStorage.removeItem(`${key}${LS_DRAFT_SUFFIX}`)
    }
  }
}

interface ILSOptions {
  /**
   * Whether to persist the draft to localStorage or not.
   */
  draft?: boolean
}
