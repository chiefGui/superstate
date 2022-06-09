import { superstate } from '.'

describe('superstate', () => {
  describe('now', () => {
    test('returns initial value', () => {
      const count = superstate(0)

      expect(count.now()).toBe(0)
    })
  })

  describe('set', () => {
    test('assigns the value to the draft', () => {
      const count = superstate(0)

      count.set(5)

      expect(count.draft()).toBe(5)
    })

    test('assigns the value to the draft based on the previous `draft`', () => {
      const count = superstate(0)

      count.set(5)
      count.set((prev) => prev + 5)

      expect(count.draft()).toBe(10)
    })

    test('assigns the value to the draft based on the previous `now`', () => {
      const count = superstate(10)

      count.set((prev) => prev + 10)

      expect(count.draft()).toBe(20)
    })

    test('assigns the value to the draft without broadcasting changes', () => {
      const count = superstate(0)

      const subscriber = jest.fn()
      count.subscribe(subscriber, 'draft')

      count.set(5, true)
      expect(subscriber).toHaveBeenCalledTimes(1)

      count.set(5, true)
      expect(subscriber).toHaveBeenCalledTimes(2)

      count.set(5, false)
      expect(subscriber).toHaveBeenCalledTimes(2)
    })

    test('assigns the value to the draft and publish in chain', () => {
      const count = superstate(0)

      count.set(5).publish()

      expect(count.now()).toBe(5)
    })

    test('assigns the value to the draft and discard in chain', () => {
      const count = superstate(0)

      count.set(5).discard()

      expect(count.draft()).toBeUndefined()
      expect(count.now()).toBe(0)
    })
  })

  describe('publish', () => {
    test('discards the draft after pubilsh', () => {
      const count = superstate(0)

      count.set(5)
      expect(count.draft()).toBe(5)

      count.publish()
      expect(count.draft()).toBeUndefined()
    })

    test('sets `now` to be the same value as `draft`', () => {
      const count = superstate(0)

      count.set(5)
      expect(count.now()).toBe(0)

      count.publish()
      expect(count.now()).toBe(5)
    })

    test('sets `now` bypassing `draft`', () => {
      const count = superstate(0)

      count.publish(5)

      expect(count.now()).toBe(5)
    })
  })

  describe('discard', () => {
    test('discards the draft', () => {
      const count = superstate(0)

      count.set(5)
      expect(count.draft()).toBe(5)

      count.discard()
      expect(count.draft()).toBeUndefined()
    })
  })

  describe('extensions', () => {
    test('changes the draft based on now', () => {
      const count = superstate(5).extend({
        sum: ({ now }, num: number) => now + num,
      })

      count.sum(10)

      expect(count.draft()).toBe(15)
    })

    test('changes the draft based on prev draft', () => {
      const count = superstate(5).extend({
        sum: ({ now, draft }, num: number) => (draft ?? now) + num,
      })

      count.set(10)
      count.sum(5)

      expect(count.draft()).toBe(15)
    })
  })

  describe('subscribe', () => {
    test('reacts to `now` changes via set/publish', () => {
      const count = superstate(0)

      const sub = jest.fn()

      count.subscribe(sub)

      count.set(5)
      count.publish()

      expect(sub).toHaveBeenCalledTimes(1)
    })

    test('reacts to `now` changes via publish', () => {
      const count = superstate(0)

      const sub = jest.fn()

      count.subscribe(sub)

      count.publish(5)

      expect(sub).toHaveBeenCalledTimes(1)
    })

    test('reacts to `draft` changes', () => {
      const count = superstate(0)

      const sub = jest.fn()

      count.subscribe(sub, 'draft')

      count.set(5)

      expect(sub).toHaveBeenCalledTimes(1)
    })

    test('stop reacting when unsubscribe', () => {
      const count = superstate(0)

      const sub = jest.fn()

      const unsub = count.subscribe(sub, 'draft')
      count.set(5)
      expect(sub).toHaveBeenCalledTimes(1)

      unsub()
      count.set(5)
      expect(sub).toHaveBeenCalledTimes(1)
    })
  })
})
