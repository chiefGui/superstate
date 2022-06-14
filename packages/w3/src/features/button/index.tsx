export function Button({ children, ...rest }: IButtonProps) {
  return (
    <button
      className='h-12 px-6 font-bold text-black transition-all bg-white cursor-pointer rounded-3xl hover:bg-yellow-600 active:scale-95'
      {...rest}>
      {children}
    </button>
  )
}

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}
