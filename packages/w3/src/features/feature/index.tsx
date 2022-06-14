import { tm } from '../../util/tm'

export function Feature({
  title,
  icon,
  children,
}: {
  title: string
  children: React.ReactNode
  icon?: string
}) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-center w-16 h-16 text-2xl text-center text-black bg-yellow-600 rounded-full'>
          <i className={tm('fal', icon)} />
        </div>

        <h3>{title}</h3>
      </div>

      <div>
        <p>{children}</p>
      </div>
    </div>
  )
}
