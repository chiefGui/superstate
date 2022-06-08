# superstate <!-- omit in toc -->

A minimal, sleek, 1 dependency only library to manage shared state. Works in the browser and Node applications. Written in TypeScript, with a hook for React.

## Table of Contents <!-- omit in toc -->
- [Quick Start](#quick-start)
- [Usage with React](#usage-with-react)
- [Drafts](#drafts)
- [Doing stuff when the state change](#doing-stuff-when-the-state-change)
  - [When are the changes broadcasted?](#when-are-the-changes-broadcasted)
- [Middlewares](#middlewares)
  - [Writing middlewares](#writing-middlewares)
- [Why?](#why)

## Quick Start

1. Install the package, either through `npm` or `yarn`:
```shell
npm install @superstate/core 
```

```shell
yarn add @superstate/core 
```

2. Import and wrap any value within `superstate`:
```ts
import { superstate } from '@superstate/core'

const count = superstate(0)
```

3. Update your state:

```ts
count.set(5)
count.publish()
```

4. See the new value:

```ts
console.log(count.now()) // 5
```

## Usage with React

```shell
yarn add @superstate/react
```

```tsx
import { superstate } from '@superstate/core'
import { useSuperState } from '@superstate/react'

const count = superstate(0)

function MyComponent() {
  useSuperState(count)

  return <div>{count.now()}</div>
}
```

## Drafts
When writing an email or a message to someone, the apps usually asks us to hit `Submit` (thankfully) and only then whatever we wrote is computed and delivered to the destination. If we think about it, prior to submitting the message,  we're in a "draft" state, which is an opportunity to improve and/or correct any issues with whatever we typed. One cool thing about `superstate` is the built-in drafts feature, which is exactly that: an opportunity for us to go wild with our state without letting the world know about it.

In practice, the above means it's easy for you to build a text editor with undo capabilities without having to think too much. Another interesting use-case would be a form where we want to allow the user to review the changes they made prior to officially submitting the form. Now, the two examples are easy to achieve with `superstate`. I mean, not only easy, but out-of-the-box. Let's see an example.

```ts
const text = superstate('I wrote a text!')

text.set('Oh, this text is better!')

console.log(text.now()) // displays `I wrote a text!`
console.log(text.draft()) // displays `Oh, this text is better!`
```

Cool, huh? And now, let's say you're happy with the changes and want to make it official:

```ts
text.publish() // just call `.publish()`

console.log(text.now()) // displays `Oh, this text is better!`
```

Yeah, nice. But what happens to `.draft()`? Well... it will return `undefined`. That's because once you `publish` your changes, to save you some memory, `superstate` discards the draft. It may sound stupid discarding the draft in an example as simple as the one above, but don't forget the user may be writing a text of thousands of characters, right?

## Doing stuff when the state change

We can use methods like the built-in ones `subscribe` and `subscribeDraft`:

```ts
const count = superstate(0)

count.subscribe(newCount => console.log(`the new count is ${newCount}!`))
count.subscribeDraft(newCountDraft => console.log(`the new count draft is ${newCountDraft}!`))

count.set(10) // this will call `subscribeDraft`
count.publish() // this will call `subscribe`
```

Want to stop listening? Easy: both `subscribe` and `subscribeDraft` return an `unsubscribe` function that allow you to stop listening for changes at any time:

```ts
const unsub = count.subscribe(console.log)
const unsubDraft = count.subscribeDraft(console.log)

unsub()
unsubDraft()
```

### When are the changes broadcasted?

- Whenever `now` changes, subscribers (through `subscribe`) will be called,
- Whenever `draft` changes, draft subscribers (through `subscribeDraft`) will be called.

However, `superstate` won't dispatch notifications if there's nothing relevant to know about. That said:

```
const count = superstate(0)

count.set(0) // this won't dispatch a notification
count.publish() // this won't dispatch a notification

count.set(2) // this will (for `draft` subscribers only)
count.publish() // this will (for `now` subscribers only)

count.set(2) // this won't
count.publish() // this won't
```

## Middlewares

This is superstate without any middlewares:

```ts
const count = superstate(0)
```

And this is superstate with a middleware called `sum`:

```ts
const count = superstate(0, { sum: (prev, num: number) => prev + num })
```

You might ask why "middlewares". Well, it's quite simple. Instead of repeating yourself:

```ts
const count = superstate(0)

count.set(prev => prev + 5)
```

You can do:

```ts
const count = superstate(0, { sum: (prev, num: number) => prev + num })

count.sum(5)
```

### Writing middlewares

When writing a middleware, keep in mind that its first argument is (and always should be) `prev`, which represents your current state. This is a cool thing because you don't have to worry about inconsistent data or unexpected values:

```ts
function sum(prev, num: number) {
  return prev + num
}

function multiplyAndSum(prev, operation: [number, number]) {
  return prev + operation[0] * operation[1]
}

const count = superstate(0, { sum, multiplyAndSum })

count.sum(5)
count.multiplyAndSum([2, 5])
count.publish()

console.log(count.now()) // 15
```

## Why?

The state of any application is practically the core of it. And I've already used several solutions, for both small and large scale apps: XState, Jotai and Valtio (excellent!), Recoil, React Context, Redux, etc. But I always felt there was something missing. Some were (way) too minimal, some were (way) too complex. So I decided to give my opinion about it, and then `superstate` was born.

Designed for optimal Developer Experience and ergonomics, `superstate` aims to fill the gaps I always had.

