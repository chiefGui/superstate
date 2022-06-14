export function Snippet({ children, ...rest }: ISnippetProps) {
  return (
    <code className='p-6 text-lg text-yellow-600 bg-gray-900 rounded-3xl'>
      {children}
    </code>
  )
}

interface ISnippetProps {
  children: React.ReactNode
}
