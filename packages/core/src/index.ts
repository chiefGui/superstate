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

  let _middlewares: IMiddleware<S>[] = []

  const _draftMethods: ISuperStateDraftMethods<S> = {
    draft,
    sketch,
    publish,
    discard,
  }

  const _methods: ISuperState<S> = {
    ..._draftMethods,

    set,
    now,
    subscribe,
    extend,
    use,
    unsubscribeAll,
  }

  function now() {
    return _now
  }

  function draft() {
    return _draft
  }

  function set(
    input: IMutateInput<S>,
    options?: IMutateOptions
  ): ISuperState<S> {
    if (typeof input === 'undefined' && typeof _draft === 'undefined') {
      return _methods
    }

    const prevNow = _now
    const newNow = _mutate(_now, input)

    if (deepEqual(prevNow, newNow)) {
      return _methods
    }

    _executeMiddlewares({ eventType: 'before:set' })
    _overrideNow(newNow)
    _executeMiddlewares({ eventType: 'after:set' })

    if (!options?.silent) {
      _broadcast()

      return _methods
    }

    return _methods
  }

  function publish(options?: IMutateOptions): ISuperState<S> {
    if (typeof _draft === 'undefined') {
      return _methods
    }

    const prevNow = _now
    const newNow = _draft

    if (deepEqual(prevNow, newNow)) {
      return _methods
    }

    _executeMiddlewares({ eventType: 'before:publish' })
    _overrideNow(newNow)
    _executeMiddlewares({ eventType: 'after:publish' })

    discard()

    if (!options?.silent) {
      _broadcast()

      return _methods
    }

    return _methods
  }

  function sketch(
    input: IMutateInput<S>,
    options?: IMutateOptions
  ): ISuperState<S> {
    const prevDraft = _draft
    const newDraft = _mutate(_draft ?? _now, input)

    if (deepEqual(prevDraft, newDraft)) {
      return _methods
    }

    _executeMiddlewares({ eventType: 'before:sketch' })
    _draft = newDraft
    _executeMiddlewares({ eventType: 'after:sketch' })

    if (!options?.silent) {
      _broadcastDraft()

      return _methods
    }

    return _methods
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

  function discard(options?: IMutateOptions): ISuperState<S> {
    if (typeof _draft === 'undefined') {
      return _methods
    }

    _executeMiddlewares({ eventType: 'before:discard' })
    _draft = undefined
    _executeMiddlewares({ eventType: 'after:discard' })

    if (!options?.silent) {
      _broadcastDraft()

      return _methods
    }

    return _methods
  }

  function unsubscribeAll() {
    _subscribers = []
    _draftSubscribers = []
  }

  function use(middlewares: IMiddleware<S>[]): ISuperState<S> {
    _executeMiddlewares({ eventType: 'init' }, middlewares)

    _middlewares = [..._middlewares, ...middlewares]

    return _methods
  }

  function extend<E extends IExtensions<S>>(
    extensions: E
  ): ISuperState<S> & IExtensionMethods<S, E> {
    return { ..._methods, ..._prepareExtensions(extensions) }
  }

  function _overrideNow(newNow: S) {
    _executeMiddlewares({ eventType: 'before:change' })
    _now = newNow
    _executeMiddlewares({ eventType: 'after:change' })
  }

  function _mutate(value: S | IDraft<S>, input: IMutateInput<S>) {
    const clone = _cloneObj(value)

    return _isMutator(input) ? input(clone) : input
  }

  function _executeMiddlewares(
    { eventType }: Pick<IMiddlewareInput<S>, 'eventType'>,
    middlewares?: IMiddleware<S>[]
  ) {
    const targetMiddlewares = middlewares || _middlewares

    if (!targetMiddlewares.length) {
      return
    }

    targetMiddlewares.forEach((m) => {
      m({ eventType, ..._methods })
    })
  }

  function _prepareExtensions<E extends IExtensions<S>>(
    extensions: E
  ): IExtensionMethods<S, E> {
    return Object.keys(extensions).reduce((prev, extensionKey) => {
      return {
        ...prev,

        [extensionKey]: (...params: IExtensionUserParams) => {
          const result = extensions[extensionKey](
            _getExtensionProps(),
            ...params
          )

          if (typeof result === 'undefined') {
            return
          }

          return result
        },
      }
    }, {} as IExtensionMethods<S, E>)
  }

  function _getExtensionProps(): IExtensionPropsBag<S> {
    return _methods
  }

  function _broadcast() {
    _executeMiddlewares({ eventType: 'before:broadcast:now' })
    _subscribers.forEach((s) => s(_now))
    _executeMiddlewares({ eventType: 'after:broadcast:now' })
  }

  function _broadcastDraft() {
    _executeMiddlewares({ eventType: 'before:broadcast:draft' })
    _draftSubscribers.forEach((ds) => ds(_draft))
    _executeMiddlewares({ eventType: 'after:broadcast:draft' })
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

function _isMutator<S>(value: IMutateInput<S>): value is (prev: S) => S {
  return typeof value === 'function'
}

export interface ISuperState<S> extends ISuperStateDraftMethods<S> {
  /**
   * @returns The current value of the state.
   */
  now: () => S

  /**
   * Mutates the value of `now`. If the input is `undefined`, it uses the `draft` value instead.
   *
   * It won't broadcast any changes if the previous `now` would be equal the new `now`.
   */
  set: ISetFn<S>

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
   * Adds a middleware to superstate.
   */
  use: IUseFn<S>
}

export interface ISuperStateDraftMethods<S> {
  /**
   * @retur The draft version of your state. May be `undefined` if no draft is available. To set the value of the draft, call `.set()`.
   */
  draft: IDraftFn<S>

  /**
   * Overrides the value of `now` with the value of `draft`.
   *
   * If `draft` is `undefined`, nothing will happen.
   *
   * If `draft` is equals to `now`, nothing will happen either.
   */
  publish: () => ISuperState<S>

  /**
   * Discards the draft, setting its value to `undefined`.
   * Upon calling this function, a draft broadcast will occur.
   */
  discard: IDiscardFn<S>

  /**
   * Assigns the value passed via `input` to `draft`.
   *
   * @param input It can be a raw value or a function whose first and sole argument is the value of the previous `draft`. In case there is no previous draft, the first argument will be the previous value of `now`.
   * @param options.silent (default: `false`) Whether to broadcast the change.
   */
  sketch: ISketchFn<S>
}

export type IExtensionPropsBag<S> = ISuperState<S>

/**
 * The type of the draft.
 * Almost the same thing as the state,
 * except it can be `undefined`.
 */
export type IDraft<S> = S | undefined

type IMutateInput<S> = ((prev: S) => S) | S
type IMutateOptions = {
  /**
   * Whether to broadcast the change or not.
   *
   * `true`: broadcast the change,
   *
   * `false`: don't broadcast the change.
   */
  silent?: boolean
}
type ISubscriber<S> = (newState: S) => void

type IExtensionUserParams = any[]
type IExtensionAllParams<S> = [IExtensionPropsBag<S>, ...IExtensionUserParams]
type IExtension<S, O = void> = (...params: IExtensionAllParams<S>) => O
type IExtensions<S> = Record<string, IExtension<S>>
type IExtensionMethods<S, E extends IExtensions<S>> = {
  [key in keyof E]: (
    ...params: DropFirst<Parameters<E[key]>>
  ) => ReturnType<E[key]>
}

type IUnsubscribe = () => void

type ISketchFn<S> = (
  input: IMutateInput<S>,
  options?: IMutateOptions
) => ISuperState<S>
type ISetFn<S> = (
  input: IMutateInput<S>,
  options?: IMutateOptions
) => ISuperState<S>
type IDiscardFn<S> = () => ISuperState<S>
type IDraftFn<S> = () => IDraft<S>
type IUseFn<S> = (middlewares: IMiddleware<S>[]) => ISuperState<S>

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never

export type IMiddlewareInput<S = any> = ISuperState<S> & {
  eventType: IMiddlewareEventType
}
type IMiddleware<S> = (input: IMiddlewareInput<S>) => void
type IMiddlewareEventType =
  | 'init'
  | 'before:set'
  | 'after:set'
  | 'before:sketch'
  | 'after:sketch'
  | 'before:publish'
  | 'after:publish'
  | 'before:change'
  | 'after:change'
  | 'before:discard'
  | 'after:discard'
  | 'before:broadcast:now'
  | 'after:broadcast:now'
  | 'before:broadcast:draft'
  | 'after:broadcast:draft'
