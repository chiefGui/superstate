import { superstate } from '@superstate/core'

import { ls } from './ls'

describe('ls', () => {
  test('stores to localStorage when publish', () => {
    const count = superstate(0).use([ls('count')])

    count.publish(5)

    expect(localStorage.getItem('count')).toBe('5')
  })

  test('stores to localStorage more complex, nested objects', () => {
    const user = superstate({
      id: 'john',
      posts: [{ title: 'hello world' }],
    }).use([ls('user')])

    user.publish((prev) => ({
      ...prev,
      posts: [...prev.posts, { title: 'goodbye world' }],
    }))

    expect(
      JSON.parse(localStorage.getItem('user') as string).posts
    ).toHaveLength(2)

    expect(
      JSON.parse(localStorage.getItem('user') as string).posts[1].title
    ).toBe('goodbye world')
  })

  test('sets now from localStorage', () => {
    localStorage.setItem('count', '5')

    const count = superstate(0).use([ls('count')])

    expect(count.now()).toBe(5)
  })
})
