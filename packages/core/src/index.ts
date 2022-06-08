import * as deepEqual from 'fast-deep-equal'

/**
 * The superstate function. This is the function that you should use to create a superstate.
 *
 * @param initialState The initial state.
 * @param helpers
 * @returns Methods to work with your state.
 */
export function superstate<
  S,
  M extends Record<string, (...params: [S, ...any[]]) => IHelperReturn<S>>
>(initialState: S, helpers?: M) {
  let _now = initialState
  let _draft: IDraft<S> = undefined

  let _subscribers: ISubscriber<S>[] = []
  let _draftSubscribers: ISubscriber<IDraft<S>>[] = []

  /**
   * @returns The current state.
   */
  function now() {
    return _now
  }

  /**
   *
   * @returns The current draft.
   */
  function draft() {
    return _draft
  }

  /**
   * Sets the value passed through `input` to the draft.
   *
   * This function won't broadcast a draft change if the previous value is equal to the new value.
   *
   * @param input It can be a raw value or a function whose first and sole argument is the value of the previous `draft`. In case there is no previous draft, the first argument will be the previous value of `now`.
   */
  function set(input: ISetInput<S>) {
    const clone = cloneState(_draft || _now)

    _draft = isMutator(input) ? input(clone) : input

    if (!deepEqual(_draft, _now)) {
      _broadcastDraft()
    }
  }

  /**
   * Publishes the draft, setting the value of `now` to be the same as the draft and discarding the draft.
   *
   * It won't broadcast any changes if the previous value is equal to the new value.
   */
  function publish(input?: ISetInput<S>) {
    if (!input && typeof _draft === 'undefined') {
      return
    }

    const prev = _now

    if (input) {
      set(input)
    }

    _now = _draft as S

    discard()

    if (!deepEqual(prev, _now)) {
      _broadcast()
    }
  }

  /**
   * Starts monitoring changes to the state.
   *
   * @param subscriber A function that will be called when `now` or `draft` changes (depends on `target`).
   * @param target Can be either `now` or `draft` (default: `now`)
   * @returns
   */
  function subscribe(subscriber: ISubscriber<S>, target?: 'draft' | 'now') {
    if (target === 'draft') {
      _subscribeDraft(subscriber as ISubscriber<IDraft<S>>)
      return
    }

    const nextIndex = _subscribers.length

    _subscribers.push(subscriber)

    return () =>
      (_subscribers = [
        ..._subscribers.slice(0, nextIndex),
        ..._subscribers.slice(nextIndex + 1, _subscribers.length),
      ])
  }

  /**
   * Discards the draft, setting its value to `undefined`.
   *
   * Upon calling this function, a draft broadcast will occur.
   */
  function discard() {
    _draft = undefined
    _broadcastDraft()
  }

  /**
   * Unsubscribes all `now` and `draft` subscribers.
   *
   * After you call this method, changes will no longer be
   * broadcasted.
   */
  function unsubscribeAll() {
    _subscribers = []
    _draftSubscribers = []
  }

  function _broadcast() {
    _subscribers.forEach((s) => {
      s(_now)
    })
  }

  function _broadcastDraft() {
    _draftSubscribers.forEach((ds) => ds(_draft))
  }

  function _preparehelpers() {
    if (!helpers) {
      return {} as { [key in keyof M]: () => void }
    }

    return Object.keys(helpers).reduce(
      (prev, helperKey) => {
        return {
          ...prev,
          [helperKey]: (...args: any[]) => {
            const result = helpers[helperKey](cloneState(_now), ...args)

            if (typeof result === 'undefined') {
              return
            }

            set(result)
          },
        }
      },
      {} as {
        [key in keyof M]: (
          ...params: DropFirst<Parameters<M[key]>>
        ) => IHelperReturn<S>
      }
    )
  }

  function _subscribeDraft(subscriber: ISubscriber<IDraft<S>>) {
    const nextIndex = _draftSubscribers.length

    _draftSubscribers.push(subscriber)

    return () =>
      (_draftSubscribers = [
        ..._draftSubscribers.slice(0, nextIndex),
        ..._draftSubscribers.slice(nextIndex + 1, _draftSubscribers.length),
      ])
  }

  return {
    now,
    draft,
    set,
    discard,
    publish,
    subscribe,
    unsubscribeAll,

    ..._preparehelpers(),
  }
}

export interface ISuperState<S> {
  now: () => S
  draft: () => IDraft<S>
  discard: () => void
  publish: () => void
  subscribe: (subscriber: ISubscriber<S>) => () => ISubscriber<S>[]
  subscribeDraft: (
    subscriber: ISubscriber<IDraft<S>>
  ) => () => ISubscriber<IDraft<S>>[]
}

export type IDraft<S> = S | undefined

function cloneState<S>(inputState: S) {
  if (inputState instanceof Map) {
    return new Map(inputState)
  }

  if (inputState instanceof Set) {
    return new Set(inputState)
  }

  return JSON.parse(JSON.stringify(inputState))
}

function isMutator<S>(value: ISetInput<S>): value is (prev: S) => S {
  return typeof value === 'function'
}

type ISetInput<S> = ((prev: S) => S) | S
type ISubscriber<S> = (newState: S) => void
type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never
type IHelperReturn<S> = S | void | undefined
