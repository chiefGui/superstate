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
    set,
    publish,
    discard,
  }

  const _methods: ISuperState<S> = {
    ..._draftMethods,

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

  function set(input: ISetInput<S>, options?: ISetOptions) {
    const clone = _cloneObj(_draft || _now)

    _executeMiddlewares({ eventType: 'before:set' })

    const prevDraft = _draft
    _draft = _isMutator(input) ? input(clone) : input

    if (!options?.silent && !deepEqual(prevDraft, _draft)) {
      _broadcastDraft()
    }

    _executeMiddlewares({ eventType: 'after:set' })

    return _draftMethods
  }

  function publish(input?: ISetInput<S>, options?: ISetOptions) {
    if (typeof input === 'undefined' && typeof _draft === 'undefined') {
      return
    }

    _executeMiddlewares({ eventType: 'before:publish' })

    const prev = _now

    if (input) {
      set(input, { silent: true })
    }

    _now = _draft as S

    discard()

    if (!options?.silent && !deepEqual(prev, _now)) {
      _broadcast()
    }

    _executeMiddlewares({ eventType: 'after:publish' })
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
    _executeMiddlewares({ eventType: 'before:discard' })

    _draft = undefined
    _broadcastDraft()

    _executeMiddlewares({ eventType: 'after:discard' })
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
          const result: IExtensionOutput<S> = extensions[extensionKey](
            _getExtensionProps(),
            ...params
          )

          if (typeof result === 'undefined') {
            return
          }

          return _draftMethods
        },
      }
    }, {} as IExtensionMethods<S, E>)
  }

  function _getExtensionProps(): IExtensionPropsBag<S> {
    return {
      draft,
      set,
      publish,
      discard,
      now: _cloneObj(_now),
    }
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

function _isMutator<S>(value: ISetInput<S>): value is (prev: S) => S {
  return typeof value === 'function'
}

export interface ISuperState<S> extends ISuperStateDraftMethods<S> {
  /**
   * @returns The most accurate value of your state. The one your clients must trust the most.
   */
  now: () => S

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
   * Discards the draft, setting its value to `undefined`.
   * Upon calling this function, a draft broadcast will occur.
   */
  discard: IDiscardFn

  /**
   * Publishes the value passed in the input or the `draft`, if the input is `undefined`.
   *
   * It won't broadcast any changes if the previous `now` would be equal the new `now`.
   */
  publish: IPublishFn<S>

  /**
   * Sets the value passed through `input` to the draft.
   *
   * This function won't broadcast a draft change if the previous value is equal to the new value.
   *
   * @param input It can be a raw value or a function whose first and sole argument is the value of the previous `draft`. In case there is no previous draft, the first argument will be the previous value of `now`.
   * @param options.silent (default: `false`) Whether to broadcast the change.
   */
  set: ISetFn<S>
}

export type IExtensionPropsBag<S> = ISuperStateDraftMethods<S> & {
  now: S
}

/**
 * The type of the draft.
 * Almost the same thing as the state,
 * except it can be `undefined`.
 */
export type IDraft<S> = S | undefined

type ISetInput<S> = ((prev: S) => S) | S
type ISetOptions = {
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

type IExtensionOutput<S> = S | void | undefined | ISuperStateDraftMethods<S>
type IExtensionUserParams = any[]
type IExtensionAllParams<S> = [IExtensionPropsBag<S>, ...IExtensionUserParams]
type IExtension<S> = (...params: IExtensionAllParams<S>) => IExtensionOutput<S>
type IExtensions<S> = Record<string, IExtension<S>>
type IExtensionMethods<S, E extends IExtensions<S>> = {
  [key in keyof E]: (
    ...params: DropFirst<Parameters<E[key]>>
  ) => ISuperStateDraftMethods<S>
}

type IUnsubscribe = () => void

type ISetFn<S> = (
  input: ISetInput<S>,
  options?: ISetOptions
) => ISuperStateDraftMethods<S>
type IPublishFn<S> = (input?: ISetInput<S>, options?: ISetOptions) => void
type IDiscardFn = () => void
type IDraftFn<S> = () => IDraft<S>
type IUseFn<S> = (middlewares: IMiddleware<S>[]) => ISuperState<S>

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never

export type IMiddlewareInput<S = any> = ISuperState<S> & {
  eventType: IMiddlewareEventType
}
type IMiddleware<S> = (input: IMiddlewareInput<S>) => void
type IMiddlewareEventType =
  | 'init'
  | 'before:publish'
  | 'after:publish'
  | 'before:set'
  | 'after:set'
  | 'before:discard'
  | 'after:discard'
  | 'before:broadcast:now'
  | 'after:broadcast:now'
  | 'before:broadcast:draft'
  | 'after:broadcast:draft'
