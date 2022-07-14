<div align="center">

_Is it a bird? Is it a plane? No, it is **superstate**!_

</div>

![superstate hero](https://i.imgur.com/EhecV7G.png)

<div align="center">
   
### Behold your next favorite state management library for the XXI century.
  
[Quick Start](https://superstate.dev/getting-started/first-state) · [Documentation](https://superstate.dev) · [Examples](https://superstate.dev/examples) · [API Reference](https://superstate.dev/api-reference/@superstate/core/superstate)
</div>

---

```shell
yarn add @superstate/core
```

---

#### ✨ **Simple, sleek & elegant API**

```ts
import { superstate } from "@superstate/core"

const count = superstate(0)

count.set(5)

console.log(count.now()) // 5
```

_Yep, that simple. No PhD required._

#### 🤯 Mindlessly easy to share state across your entire app

```ts
// count.ts
import { superstate } from "@superstate/core"

export const count = superstate(0)

// calculator.ts
import { count } from "./count.ts"

count.set(5)

// app.ts
import { count } from "./count.ts"

// When calculator.ts changes count, it'll call the callback below! :D
count.subscribe((value) => {
  console.log(value)
})
```

_The trick is the `export` keyword: to share your state, all you have to do is exporting and importing it._

#### 📐 Designed with ergonomy and developer wellness in mind

**superstate** puts the developer first&mdash;from the beginner to the veteran. No changes are made without thorough consideration and confidence that working with superstate is pure pleasure.

#### 🧩 Fully extensible

Instead of building **superstate** with lots of useless opinionated features, the idea is to give you the tools to expand it as much as you need&mdash;and only _when_ you need. Middlewares and Extensions are at your service.

#### 📝 Built-in Drafts System

Great UX doesn't have to be a burden to build. With the built-in Drafts System, you can give your users second chances without spending an extra day on it.

```ts
const count = superstate(0)

count.sketch(5)
console.log(count.draft()) // 5
console.log(count.now()) // 0

count.publish()
console.log(count.draft()) // undefined
console.log(count.now()) // 5
```

#### 🤘 Simple enough for prototypes and scalable enough for the world's next big thing

Regardless of the scale of your project, **superstate** _will_ fit. It is very compact for prototypes, but if your app hits big, **superstate** follows along. Have an ongoing application? It's all right&mdash;**superstate** can be incrementally adopted so you don't have to worry if the first rails are already built.

#### ⌨️ Proudly written in TypeScript

Building **superstate** without TypeScript was never an option.

#### ⚛️ Deadly simple integration with React apps

```tsx
import { superstate } from '@superstate/core'
import { useSuperState } from '@superstate/react'

const count = superstate(0)

export const MyComponent = () => {
  useSuperState(count)

  return (
    <div>
      <div>Count: ${count}</div>
      <button onClick={() => count.set(prev => prev + 1))>Increase</button>
    </div>
  )
}
```

You read it right: calling the `useSuperState(count)` hook is all you need to make your component re-render when `count` increases.

#### 🌐 Works in the browser or in Node environments

Browser-only apps, hybrid apps (such as [Electron](https://www.electronjs.org/)), Node apps... check, check, check!

---

#### Brought to you by 🇧🇷 [Guilherme "chiefGui" Oderdenge](https://github.com/chiefGui).

---

The MIT License (MIT)

Copyright (c) 2022 Guilherme Oderdenge

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
