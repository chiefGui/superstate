import { IMiddlewareInput } from '@superstate/core'

/**
 * superstate's localStorage adapter. A middleware
 * to load from/write to localStorage.
 *
 * @param key The `localStorage` key to save to.
 */
export function ls<S = any>(key: string) {
  return ({ eventType, now, publish }: IMiddlewareInput<S>) => {
    if (eventType === 'init') {
      const foundLocalStorageItem = localStorage.getItem(key)

      if (!foundLocalStorageItem) {
        return
      }

      publish(JSON.parse(foundLocalStorageItem))

      return
    }

    if (eventType === 'after:publish') {
      localStorage.setItem(key, JSON.stringify(now()))
    }
  }
}
