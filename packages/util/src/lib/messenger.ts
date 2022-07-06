export const LOG_HR = `------------------------------`

export function panic(input: IPanicInput = { errorClass: Error }) {
  throw new (input.errorClass || SuperStateError)(
    constructMessageString(input.message)
  )
}

export function assertValidity<T>(
  thing: T | undefined,
  condition?: boolean,
  panicInput?: IPanicInput
): asserts thing is T {
  if (typeof condition !== 'undefined' && !condition) {
    return panic(panicInput)
  }

  if (thing === undefined) {
    panic(panicInput)
  }

  return
}

function constructMessageString(message?: IMessage): string {
  if (!message) {
    return `An unexpected error occurred on superstate. We apologise.`
  }

  return `

---- 🤔 What happened? ---------------------------

${message?.what}${
    message.intelligence
      ? `\n\n---- 🧠 Intelligence -------------------------------

This is the relevant data we have:${Object.keys(message.intelligence)
          .map((ik) => {
            return `\n\n  \`${ik}\`:

      ${JSON.stringify(message.intelligence?.[ik], getCircularReplacer())}`
          })
          .join('')}`
      : ''
  }
${message.solutions
  .map((s, i) => {
    return `\n---- ✅ Possible solution (#${i + 1}) -------------------

${s}
`
  })
  .join('')}${
    message.references
      ? `\n---- 📚 References -------------------------------
${message.references
  .map((r) => {
    return `\n🔗 ${r} `
  })
  .join('')}\n`
      : ''
  }
---- 🆘 Need further assistance? -----------------

Please, file an issue on GitHub: https://github.com/chiefGui/superstate/issues/new`
}

interface IPanicInput {
  message?: IMessage
  errorClass?: typeof Error
}

interface IMessage {
  what: string
  solutions: string[]
  references?: string[]
  intelligence?: Record<string, any>
}

class SuperStateError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'superstateError'
  }
}

const getCircularReplacer = () => {
  const seen = new WeakSet()

  return (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}
