import { superstate } from '@superstate/core'
import { useSuperState } from '@superstate/react'

const notifications = {
  state: superstate<Notification[]>([]),

  notify(message: string) {
    const id = Math.random().toString()

    notifications.state.set((prev) => [...prev, { id, message }])

    setTimeout(() => notifications.destroy(id), 3000)
  },

  destroy(id: string) {
    notifications.state.set((prev) => prev.filter((n) => n.id !== id))
  },

  get() {
    return notifications.state.now()
  },
}

const lang = superstate('en')

export default function Index() {
  useSuperState(lang)
  useSuperState(notifications.state)

  return (
    <div className='flex flex-col gap-4 p-10'>
      <div className='flex items-center justify-between w-full'>
        <button
          onClick={() =>
            notifications.notify(
              lang.now() === 'en' ? 'Hello world' : 'Olá mundo'
            )
          }
          className='p-4 font-bold bg-blue-500 w-fit rounded-xl'>
          {lang.now() === 'en' ? 'Notify' : 'Notificar'}
        </button>

        <button
          onClick={() => lang.set((prev) => (prev === 'en' ? 'pt' : 'en'))}
          className='p-4 font-bold bg-blue-500 w-fit rounded-xl'>
          {lang.now()}
        </button>
      </div>

      {notifications.get().length > 0 && (
        <ul className='flex flex-col gap-2'>
          {notifications.get().map((n) => {
            return (
              <li
                key={n.id}
                className='p-4 text-black bg-white w-fit rounded-xl'>
                {n.message}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export async function getServerSideProps() {
  return {
    props: {
      superstate: {
        lang: 'pt',
      },
    },
  }
}

interface Notification {
  id: string
  message: string
}
