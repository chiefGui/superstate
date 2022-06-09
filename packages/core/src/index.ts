import deepEqual from 'fast-deep-equal'

/**
 * The superstate function. This is the function that you should use to create a superstate.
 *
 * @param initialState The initial state.
 * @returns Methods (`ISuperState`) to work with your state.
 */
export function superstate<S>(initialState: S): ISuperState<S> {
  let _now = initialState
  let _draft: IDraft<S> = undefined

  let _subscribers: ISubscriber<S>[] = []
  let _draftSubscribers: ISubscriber<IDraft<S>>[] = []

  const _draftMethods: ISuperStateDraftMethods<S> = {
    draft,
    set,
    publish,
    discard,
  }

  const _methods: ISuperState<S> = {
    ..._draftMethods,

    now,
    subscribe,
    extend,
    unsubscribeAll,
  }

  function now() {
    return _now
  }

  function draft() {
    return _draft
  }

  function set(input: ISetInput<S>, broadcast = true) {
    const clone = _cloneObj(_draft || _now)

    _draft = _isMutator(input) ? input(clone) : input

    if (broadcast && !deepEqual(_draft, _now)) {
      _broadcastDraft()
    }

    return _draftMethods
  }

  function publish(input?: ISetInput<S>) {
    if (!input && typeof _draft === 'undefined') {
      return
    }

    const prev = _now

    if (input) {
      set(input, false)
    }

    _now = _draft as S

    discard()

    if (!deepEqual(prev, _now)) {
      _broadcast()
    }
  }

  function subscribe(
    subscriber: ISubscriber<S>,
    target?: 'draft' | 'now'
  ): IUnsubscribe {
    if (target === 'draft') {
      return _subscribeDraft(subscriber as ISubscriber<IDraft<S>>)
    }

    const nextIndex = _subscribers.length

    _subscribers.push(subscriber)

    return () =>
      (_subscribers = [
        ..._subscribers.slice(0, nextIndex),
        ..._subscribers.slice(nextIndex + 1, _subscribers.length),
      ])
  }

  function discard() {
    _draft = undefined
    _broadcastDraft()
  }

  function unsubscribeAll() {
    _subscribers = []
    _draftSubscribers = []
  }

  function extend<E extends IExtensions<S>>(
    extensions: E
  ): ISuperState<S> & IExtensionMethods<S, E> {
    return { ..._methods, ..._prepareExtensions(extensions) }
  }

  function _prepareExtensions<E extends IExtensions<S>>(
    extensions: E
  ): IExtensionMethods<S, E> {
    return Object.keys(extensions).reduce((prev, extensionKey) => {
      return {
        ...prev,

        [extensionKey]: (...params: IExtensionUserParams) => {
          const result: IExtensionOutput<S> = extensions[extensionKey](
            _getExtensionProps(),
            ...params
          )

          if (typeof result === 'undefined') {
            return
          }

          set(result)

          return _draftMethods
        },
      }
    }, {} as IExtensionMethods<S, E>)
  }

  function _getExtensionProps(): IExtensionProps<S> {
    return {
      draft: _cloneObj(_draft),
      now: _cloneObj(_now),
    }
  }

  function _broadcast() {
    _subscribers.forEach((s) => {
      s(_now)
    })
  }

  function _broadcastDraft() {
    _draftSubscribers.forEach((ds) => ds(_draft))
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

  return _methods
}

function _cloneObj<S>(inputState: S) {
  if (inputState === undefined) {
    return undefined
  }

  if (inputState instanceof Map) {
    return new Map(inputState)
  }

  if (inputState instanceof Set) {
    return new Set(inputState)
  }

  return JSON.parse(JSON.stringify(inputState))
}

function _isMutator<S>(value: ISetInput<S>): value is (prev: S) => S {
  return typeof value === 'function'
}

export interface ISuperState<S> extends ISuperStateDraftMethods<S> {
  /**
   * @returns The current state.
   */
  now: () => S

  /**
   * Extends superstate with additional methods.
   *
   * Note: Currently only extensions that mutates the draft are supported.
   *
   * @param IExtension The extensions to add.
   * @returns The extended superstate.
   */
  extend: <E extends IExtensions<S>>(
    extensions: E
  ) => ISuperState<S> & IExtensionMethods<S, E>

  /**
   * Starts monitoring changes to the state.
   *
   * @param subscriber A function that will be called when `now` or `draft` changes (depends on `target`).
   * @param target Can be either `now` or `draft` (default: `now`)
   * @returns A function to unsubscribe.
   */
  subscribe: (
    subscriber: ISubscriber<S>,
    target?: 'draft' | 'now' | undefined
  ) => IUnsubscribe

  /**
   * Unsubscribes all `now` and `draft` subscribers.
   *
   * After you call this method, changes will no longer be
   * broadcasted.
   */
  unsubscribeAll: () => void
}

export interface ISuperStateDraftMethods<S> {
  /**
   * @returns The current draft.
   */
  draft: () => IDraft<S>

  /**
   * Discards the draft, setting its value to `undefined`.
   *
   * Upon calling this function, a draft broadcast will occur.
   */
  discard: () => void

  /**
   * Publishes the draft, setting the value of `now` to be the same as the draft and discarding the draft.
   *
   * It won't broadcast any changes if the previous value is equal to the new value.
   */
  publish: (input?: ISetInput<S>) => void

  /**
   * Sets the value passed through `input` to the draft.
   *
   * This function won't broadcast a draft change if the previous value is equal to the new value.
   *
   * @param input It can be a raw value or a function whose first and sole argument is the value of the previous `draft`. In case there is no previous draft, the first argument will be the previous value of `now`.
   * @param broadcast (default: `true`) Whether to broadcast the change.
   */
  set: (input: ISetInput<S>, broadcast?: boolean) => ISuperStateDraftMethods<S>
}

/**
 * The type of the draft.
 * Almost the same thing as the state,
 * except it can be `undefined`.
 */
export type IDraft<S> = S | undefined

type ISetInput<S> = ((prev: S) => S) | S
type ISubscriber<S> = (newState: S) => void

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never

type IExtensionOutput<S> = S | void | undefined
type IExtensionProps<S> = {
  draft: IDraft<S>
  now: S
}
type IExtensionUserParams = any[]
type IExtensionAllParams<S> = [IExtensionProps<S>, ...IExtensionUserParams]
type IExtension<S> = (...params: IExtensionAllParams<S>) => IExtensionOutput<S>
type IExtensions<S> = Record<string, IExtension<S>>
type IExtensionMethods<S, E extends IExtensions<S>> = {
  [key in keyof E]: (
    ...params: DropFirst<Parameters<E[key]>>
  ) => ISuperStateDraftMethods<S>
}

type IUnsubscribe = () => void
