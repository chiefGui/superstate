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

  describe('helpers', () => {
    test('changes the draft based on an immutable helper', () => {
      const count = superstate(5, { sum: (prev, num: number) => prev + num })

      count.sum(5)

      expect(count.draft()).toBe(10)
    })

    test('changes the draft based on a mutable helper', () => {
      const count = superstate(5, {
        sum: (prev, num: number) => {
          prev += num

          return prev
        },
      })

      count.sum(5)

      expect(count.draft()).toBe(10)
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
  })
})
