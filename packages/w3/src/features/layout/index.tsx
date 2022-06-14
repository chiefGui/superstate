import { tm } from '../../util/tm'

export function Layout({
  children,
  className,
  ...rest
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={tm('container', className)} {...rest}>
      {children}
    </div>
  )
}
