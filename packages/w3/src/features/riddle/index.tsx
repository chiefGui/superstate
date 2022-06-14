export function Riddle({
  riddle,
  onSelect,
}: {
  riddle: IRiddle
  onSelect: (index: number) => void
}) {
  return (
    <div className='flex flex-col gap-4'>
      <p className='text-3xl'>{riddle.title}</p>

      <ul className='flex flex-col gap-4'>
        {riddle.options.map((o, i) => {
          return (
            <li
              className='p-4 text-xl font-bold transition-all border border-white border-solid cursor-pointer rounded-3xl hover:text-yellow-600 hover:border-yellow-600'
              key={o.title}
              onClick={() => onSelect(i)}>
              {o.title}.
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export interface IRiddle {
  title: string
  options: IRiddleOption[]
}

interface IRiddleOption {
  title: string
  correct?: boolean
}
