import {
  Sandpack,
  SandpackFile,
  SandpackOptions,
} from '@codesandbox/sandpack-react'

import { tm } from '../../util/tm'

export function Code({ files, preview = true, options }: ICodeProps) {
  return (
    <div
      className={tm(
        'superstate_code',
        !preview && 'superstate_code--no-preview'
      )}>
      <Sandpack
        options={{
          showTabs: false,
          readOnly: true,
          classes: {
            'sp-layout': '!rounded-3xl !text-lg !h-fit',
            'cm-scroller': '!p-24',
          },
          ...options,
        }}
        files={files}
        template='vanilla'
        theme='dark'
        customSetup={{ dependencies: { '@superstate/core': '0.0.10' } }}
      />
    </div>
  )
}

interface ICodeProps {
  files: Record<string, string> | SandpackFile
  preview?: boolean
  options?: SandpackOptions
}
