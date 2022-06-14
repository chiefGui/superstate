import { Code } from '../../features/code'
import { Layout } from '../../features/layout'

export function QuickStart() {
  return (
    <div id='#quick-start'>
      <Layout className='flex flex-col gap-10'>
        <h2>Quick start</h2>

        <p>
          Just install <strong>superstate</strong> as any other package.
        </p>

        <Code
          files={{ '/index.tsx': `yarn add @superstate/core` }}
          preview={false}
          options={{
            visibleFiles: ['/index.ts'],
            activeFile: '/index.tsx',
            editorHeight: 'fit-content',
          }}
        />

        <p>And go have some fun!</p>

        <Code
          files={{ '/index.tsx': code }}
          preview={false}
          options={{
            visibleFiles: ['/index.ts'],
            activeFile: '/index.tsx',
            editorHeight: 'fit-content',
          }}
        />
      </Layout>
    </div>
  )
}

const code = `import { superstate } from '@superstate/core'

const count = superstate(0)

count.publish(10)

console.log(count.now()) // logs 10`
