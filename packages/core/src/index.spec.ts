import { IMiddlewareInput, superstate } from '.'

describe('superstate', () => {
  test('supports nested superstates', () => {
    const hp = superstate(100)
    const attributes = superstate({ hp })
    const hero = superstate({ attributes })

    expect(hero.now().attributes.now().hp.now()).toBe(100)
  })

  describe('now', () => {
    test('returns initial value', () => {
      const count = superstate(0)

      expect(count.now()).toBe(0)
    })
  })

  describe('set', () => {
    test('assigns a new value to `now`', () => {
      const count = superstate(0)

      count.set(5)

      expect(count.now()).toBe(5)
    })
  })

  describe('sketch', () => {
    test('assigns input value to draft', () => {
      const count = superstate(0)

      count.sketch(5)

      expect(count.draft()).toBe(5)
    })

    test('assigns input value to draft based on the previous `draft`', () => {
      const count = superstate(0)

      count.sketch(5)
      count.sketch((prev) => prev + 5)

      expect(count.draft()).toBe(10)
    })

    test('assigns input value to draft based on the previous `now`', () => {
      const count = superstate(10)

      count.sketch((prev) => prev + 10)

      expect(count.draft()).toBe(20)
    })

    test('assigns 0 to the value of the draft', () => {
      const count = superstate(10)

      count.sketch(0)

      expect(count.draft()).toBe(0)
    })

    test('assigns the value to the draft without broadcasting changes', () => {
      const count = superstate(0)

      const subscriber = jest.fn()
      count.subscribe(subscriber, 'draft')

      count.sketch(5, { silent: false })
      expect(subscriber).toHaveBeenCalledTimes(1)

      count.sketch(10, { silent: false })
      expect(subscriber).toHaveBeenCalledTimes(2)

      count.sketch(5, { silent: true })
      expect(subscriber).toHaveBeenCalledTimes(2)
    })

    test('assigns input value to draft and publish in chain', () => {
      const count = superstate(0)

      count.sketch(5).publish()

      expect(count.now()).toBe(5)
    })

    test('assigns input value to draft and discard in chain', () => {
      const count = superstate(0)

      count.sketch(5).discard()

      expect(count.draft()).toBeUndefined()
      expect(count.now()).toBe(0)
    })
  })

  describe('publish', () => {
    test('discards the draft after publish', () => {
      const count = superstate(0)

      count.sketch(5)
      expect(count.draft()).toBe(5)

      count.publish()
      expect(count.draft()).toBeUndefined()
    })

    test('sets `now` to be the same value as `draft`', () => {
      const count = superstate(0)

      count.sketch(5)
      expect(count.now()).toBe(0)

      count.publish()
      expect(count.now()).toBe(5)
    })
  })

  describe('discard', () => {
    test('discards the draft', () => {
      const count = superstate(0)

      count.sketch(5)
      expect(count.draft()).toBe(5)

      count.discard()
      expect(count.draft()).toBeUndefined()
    })
  })

  describe('subscribe', () => {
    test('reacts to `now` changes via publish', () => {
      const count = superstate(0)

      const sub = jest.fn()

      count.subscribe(sub)

      count.sketch(5)
      count.publish()

      expect(sub).toHaveBeenCalledTimes(1)
    })

    test('reacts to `now` changes via `set`', () => {
      const count = superstate(0)

      const sub = jest.fn()
      count.subscribe(sub)

      count.set(5)

      expect(sub).toHaveBeenCalledTimes(1)
    })

    test('reacts to `now` when sets 0', () => {
      const count = superstate(0)

      const sub = jest.fn()
      count.subscribe(sub)

      count.set(1)
      count.set(2)
      count.set(3)
      count.set(0)

      expect(sub).toHaveBeenCalledTimes(4)
    })

    test('reacts to `draft` changes', () => {
      const count = superstate(0)

      const sub = jest.fn()

      count.subscribe(sub, 'draft')

      count.sketch(5)

      expect(sub).toHaveBeenCalledTimes(1)
    })

    test('reacts to `draft` when set is 0', () => {
      const count = superstate(0)

      const sub = jest.fn()
      count.subscribe(sub, 'draft')

      count.sketch(1)
      count.sketch(2)
      count.sketch(3)
      count.sketch(0)

      expect(sub).toHaveBeenCalledTimes(4)
    })

    test('stop reacting when unsubscribe', () => {
      const count = superstate(0)

      const sub = jest.fn()

      const unsub = count.subscribe(sub, 'draft')
      count.sketch(5)
      expect(sub).toHaveBeenCalledTimes(1)

      unsub()
      count.sketch(5)
      expect(sub).toHaveBeenCalledTimes(1)
    })
  })

  describe('extensions', () => {
    test('sets a new value to `now`', () => {
      const count = superstate(5).extend({
        sum: ({ set }, num: number) => set((prev) => prev + num),
      })

      count.sum(10)

      expect(count.now()).toBe(15)
    })

    test('changes the draft based on prev draft', () => {
      const count = superstate(5).extend({
        sum: ({ sketch }, num: number) => sketch((prev) => prev + num),
      })

      count.sketch(10)
      count.sum(5)

      expect(count.draft()).toBe(15)
    })

    test('returns a computed value', () => {
      const user = superstate({ firstName: 'John', lastName: 'Doe' }).extend({
        fullName: ({ now }) => `${now().firstName} ${now().lastName}`,
      })

      expect(user.fullName()).toBe('John Doe')
    })
  })

  describe('middlewares', () => {
    test('calls a middleware before set', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'before:set') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.set(10)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware after set', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'after:set') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.set(10)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware before sketch', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'before:sketch') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(10)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware after sketch', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'after:sketch') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(10)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware before publish', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'before:publish') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(10).publish()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware after publish', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'after:sketch') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(10).publish()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware before change (via set)', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'before:change') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.set(10)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware after change (via set)', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'after:change') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.set(10)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware before change (via publish)', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'before:change') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(10).publish()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware after change (via publish)', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'after:change') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(10).publish()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware before discard', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'before:discard') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(10)
      count.discard()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware after discard', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'after:discard') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(10)
      count.discard()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware before broadcast now', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'before:broadcast:now') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.set(30)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware after broadcast now', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'after:broadcast:now') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.set(25)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware before broadcast draft', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'before:broadcast:draft') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(30)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('calls a middleware after broadcast draft', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'after:broadcast:draft') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(25)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('dont call middleware if silent before broadcast now', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'before:broadcast:now') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.set(30, { silent: true })

      expect(mockFn).toHaveBeenCalledTimes(0)
    })

    test('dont call middleware if silent after broadcast now', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'after:broadcast:now') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.set(25, { silent: true })

      expect(mockFn).toHaveBeenCalledTimes(0)
    })

    test('dont call middleware if silent before broadcast draft', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'before:broadcast:draft') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(30, { silent: true })

      expect(mockFn).toHaveBeenCalledTimes(0)
    })

    test('dont call middleware if silent after broadcast draft', () => {
      const mockFn = jest.fn()

      const fakeMiddleware = ({ eventType }: IMiddlewareInput<number>) => {
        if (eventType === 'after:broadcast:draft') {
          mockFn()
        }
      }

      const count = superstate(0).use([fakeMiddleware])

      count.sketch(25, { silent: true })

      expect(mockFn).toHaveBeenCalledTimes(0)
    })
  })
})
