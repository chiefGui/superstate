# Drafts

Drafting is a very powerful mechanism of **superstate** that puts any state in "sandbox mode", giving you confidence that changes you make are yet not official because they were not published. Think of a blog post: you start from a draft, edit it as much as needed and when the results are satisfactory, you proceed to publish it.

Another idea: imagine giving your users the ability to freely edit their profile (and preview it) before they hit the "save" button. With **superstate** you'd have this functionality "for free", without having to code it yourself.

## What is a "draft"?

Conceptually speaking, a draft is a preliminary version of what your users will see. You won't be relying on drafts to build your app, but instead, in the official, live state. A draft is an optimal, easy way to give users second chances.

Technically speaking, a `draft` is just a variable that holds a value before it's ready to go live.

#### You may not need drafts when...

- Your app is completely static and lack user interactions,
- Your app is so MVP that you don't have to give users second chances before they publish changes,
- You don't think your UX can benefit of giving users second chances.

#### You may need drafts when...

- Your users are actively making changes to data,
- You like to make your users happy through good UX,
- Your app has a big audience.

## Writing drafts

Whenever you `.set()` your state's value, you're creating a draft of it, hence the changes aren't yet live nor were broadcasted:

```typescript
import { superstate } from '@superstate/core'

const count = superstate(0)

count.set(5)

console.log(count.now()) // displays 0
console.log(count.draft()) // displays 5
```

## Publishing drafts

All you have to do in order to publish whatever you have in your draft is calling the `.publish()` method:

```typescript
import { superstate } from '@superstate/core'

const count = superstate(0)

count.set(5)

console.log(count.now()) // displays `0`
console.log(count.draft()) // displays `5`

count.publish()

console.log(count.now()) // displays `5`
console.log(count.draft()) // displays `undefined`
```

:::info
Whenever you publish a draft, it gets discarded, becoming `undefined`. This decision was taken to save some bits of memory.
:::

## Discarding drafts

Whenever you are unhappy with your draft, you can `.discard()` it!

```typescript
import { superstate } from '@superstate/core'

const poem = superstate('')

poem.set('Roses are red...')

console.log(poem.draft()) // displays `Roses are red...`
console.log(poem.now()) // displays ''

poem.discard()

console.log(poem.draft()) // displays undefined
console.log(poem.now()) // displays ''
```

## Monitoring drafts

Want to do something when the draft changes? Easy!

```typescript
import { superstate } from '@superstate/core'

const poem = superstate('')

poem.subscribe(console.log, 'draft')

poem.set('hello world') // this function would trigger `.sub()`.
```

If you are not interested in observing the changes made to the draft, also easy:

```typescript
import { superstate } from '@superstate/core'

const poem = superstate('')

const unsub = poem.subscribe(console.log, 'draft')

poem.set('hello world')

unsub() // from now on, `.set()` won't broadcast changes anymore
```
