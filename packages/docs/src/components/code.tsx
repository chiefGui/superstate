import React from 'react'

import { twMerge } from 'tailwind-merge'

import {
  Sandpack,
  SandpackFile,
  SandpackOptions,
} from '@codesandbox/sandpack-react'

export function Code({ files, preview = true, deps, options }: ICodeProps) {
  return (
    <div
      className={twMerge(
        'superstate-code',
        !preview && 'superstate-code--no-preview'
      )}>
      <Sandpack
        options={{
          classes: {
            'sp-layout': '!rounded-3xl !text-lg !h-fit',
            'cm-scroller': '!p-24',
          },
          ...options,
        }}
        files={files}
        template='react-ts'
        theme='dark'
        customSetup={{
          dependencies: {
            '@superstate/core': '0.0.10',
            '@superstate/react': '0.0.8',
            ...deps,
          },
        }}
      />
    </div>
  )
}

interface ICodeProps {
  files: Record<string, string> | SandpackFile
  preview?: boolean
  options?: SandpackOptions
  deps?: Record<string, string>
}
