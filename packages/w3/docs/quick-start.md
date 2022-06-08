---
sidebar_position: 2
slug: /quick-start
---

# Quick Start

There are no mysteries starting with **superstate**.

1. Install it:

```shell
yarn add @superstate/core
```

2. Then have fun:

```typescript
import { superstate } from '@superstate/core'

const count = superstate(0)

count.pub(5)

console.log(count.now) // displays `5`
```
